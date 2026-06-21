import { useMemo, useState } from "react";
import { detectFormat, getParser } from "@/core/parser";
import { normalizeTree } from "@/core/normalize/normalizeTree";
import { diffTrees } from "@/core/diff/diffEngine";
import { DEFAULT_DIFF_OPTIONS, type DiffOptions, type DiffResult, type NormalizedTree, type ParseError } from "@/types/tree";

export interface DiffPipelineResult {
  leftSource: string;
  rightSource: string;
  setLeftSource: (v: string) => void;
  setRightSource: (v: string) => void;
  leftTree: NormalizedTree;
  rightTree: NormalizedTree;
  leftErrors: ParseError[];
  rightErrors: ParseError[];
  diff: DiffResult;
  options: DiffOptions;
  setOptions: (o: DiffOptions) => void;
  isEmpty: boolean;
  reset: () => void;
}

export function useDiffPipeline(initialLeft = "", initialRight = ""): DiffPipelineResult {
  const [leftSource, setLeftSource] = useState(initialLeft);
  const [rightSource, setRightSource] = useState(initialRight);
  const [options, setOptions] = useState<DiffOptions>(DEFAULT_DIFF_OPTIONS);

  const leftParsed = useMemo(() => {
    if (!leftSource.trim()) return { nodes: [], errors: [] };
    return getParser(detectFormat(leftSource)).parse(leftSource);
  }, [leftSource]);

  const rightParsed = useMemo(() => {
    if (!rightSource.trim()) return { nodes: [], errors: [] };
    return getParser(detectFormat(rightSource)).parse(rightSource);
  }, [rightSource]);

  const leftTree = useMemo(() => normalizeTree(leftParsed.nodes, "L"), [leftParsed.nodes]);
  const rightTree = useMemo(() => normalizeTree(rightParsed.nodes, "R"), [rightParsed.nodes]);

  const diff = useMemo(
    () => diffTrees(leftTree, rightTree, options),
    [leftTree, rightTree, options],
  );

  return {
    leftSource,
    rightSource,
    setLeftSource,
    setRightSource,
    leftTree,
    rightTree,
    leftErrors: leftParsed.errors,
    rightErrors: rightParsed.errors,
    diff,
    options,
    setOptions,
    isEmpty: leftTree.nodes.length === 0 && rightTree.nodes.length === 0,
    reset: () => {
      setLeftSource("");
      setRightSource("");
    },
  };
}
