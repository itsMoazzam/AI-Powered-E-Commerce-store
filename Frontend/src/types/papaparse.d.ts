declare module 'papaparse' {
    interface ParseResult<T> {
        data: T[];
        errors: any[];
        meta: any;
    }
    export function parse<T = any>(input: File | string, config?: any): void;
    export default { parse };
}
