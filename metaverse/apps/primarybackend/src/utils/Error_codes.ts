interface ErrorFormat{
    statusCode:number,
    explaination:string
}

class AppError extends Error implements ErrorFormat {
    public statusCode:number;
    public explaination: string;
    constructor(message:string,StatusCode:number){
        super(message);
        this.statusCode = StatusCode;
        this.explaination = message;
        Error.captureStackTrace(this, this.constructor);
    }
}
export default AppError
