export class HtmlError extends Error {
    statusCode: number;
    status: string;
    constructor(message: string, statusCode: number, status: string) {
        super(message);
        this.name = 'CustomError';
        this.statusCode = statusCode;
        this.status = status;
    }
}
