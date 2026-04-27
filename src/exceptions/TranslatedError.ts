class TranslatedError extends Error {
    constructor(message: string, public translatedMessage: string) {
        super(message);
        this.translatedMessage = translatedMessage;
        this.name = "TranslatedError";
    }
}

export default TranslatedError;