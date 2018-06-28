export interface EqualityComparer {
    getHashCode(input: any): number;
    equals(a: any, b: any): boolean;
}