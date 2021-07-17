declare module 'hast-util-select' {
  const select: (selector: any, hast: any) => any;
  const selectAll: (selector: any, hast: any) => any[];

  export { select, selectAll };
}
