import type { NormalizedNode, NormalizedTree, RawNode, Side } from "@/types/tree";

function basename(path: string): string {
  const idx = path.lastIndexOf("/");
  return idx === -1 ? path : path.slice(idx + 1);
}

function parentOf(path: string): string | null {
  const idx = path.lastIndexOf("/");
  return idx === -1 ? null : path.slice(0, idx);
}

function depthOf(path: string): number {
  return path.split("/").length - 1;
}

/**
 * Ensures every directory implied by a file's path exists as its own node.
 * Input JSON often lists only files ("src/core/app.ts"); the tree view needs
 * "src" and "src/core" to exist as real, renderable nodes too.
 */
function withSyntheticAncestors(nodes: RawNode[]): RawNode[] {
  const byPath = new Map<string, RawNode>();
  for (const n of nodes) byPath.set(n.path, n);

  for (const n of nodes) {
    let parent = parentOf(n.path);
    while (parent && !byPath.has(parent)) {
      byPath.set(parent, { path: parent, kind: "dir" });
      parent = parentOf(parent);
    }
  }

  return Array.from(byPath.values());
}

export function normalizeTree(rawNodes: RawNode[], side: Side): NormalizedTree {
  const complete = withSyntheticAncestors(rawNodes);

  const nodes: NormalizedNode[] = complete
    .map((raw) => ({
      ...raw,
      id: `${side}:${raw.path}`,
      side,
      name: basename(raw.path),
      parentPath: parentOf(raw.path),
      depth: depthOf(raw.path),
    }))
    // Stable, readable order: dirs before files at the same level, then alpha.
    .sort((a, b) => {
      if (a.parentPath !== b.parentPath) {
        return (a.parentPath ?? "").localeCompare(b.parentPath ?? "");
      }
      if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  const byPath = new Map(nodes.map((n) => [n.path, n]));
  return { side, nodes, byPath };
}

// ---- Hierarchy view for rendering ---------------------------------------

export interface HierarchyNode {
  node: NormalizedNode;
  children: HierarchyNode[];
}

/** Flat NormalizedNode[] -> nested tree, for components that render indentation
 *  by structure rather than by re-deriving it from path strings every render. */
export function buildHierarchy(tree: NormalizedTree): HierarchyNode[] {
  const wrapped = new Map<string, HierarchyNode>();
  for (const node of tree.nodes) wrapped.set(node.path, { node, children: [] });

  const roots: HierarchyNode[] = [];
  for (const node of tree.nodes) {
    const entry = wrapped.get(node.path)!;
    if (node.parentPath && wrapped.has(node.parentPath)) {
      wrapped.get(node.parentPath)!.children.push(entry);
    } else {
      roots.push(entry);
    }
  }
  return roots;
}

/** Flattens a hierarchy into render order, skipping the children of any
 *  path present in `collapsedPaths`. Pure function — collapse state lives
 *  in the component, but the walk itself doesn't need React to do it. */
export interface FlatRow {
  node: NormalizedNode;
  hasChildren: boolean;
}

export function flattenHierarchy(
  hierarchy: HierarchyNode[],
  collapsedPaths: ReadonlySet<string>,
): FlatRow[] {
  const out: FlatRow[] = [];
  const walk = (list: HierarchyNode[]) => {
    for (const entry of list) {
      out.push({ node: entry.node, hasChildren: entry.children.length > 0 });
      if (entry.children.length > 0 && !collapsedPaths.has(entry.node.path)) {
        walk(entry.children);
      }
    }
  };
  walk(hierarchy);
  return out;
}
