export function batch<T>(size: number, inputs: T[]): T[][] {
  return inputs.reduce(
    (batches: T[][], input) => {
      const current = batches[batches.length - 1];

      current.push(input);

      if (current.length === size) {
        batches.push([]);
      }

      return batches;
    },
    [[]]
  );
}
