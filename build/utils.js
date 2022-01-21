var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import crypto from 'crypto';
export function generateUUID() {
    return crypto.randomBytes(16).toString('hex');
}
export function serializeMessageBody(messageBody) {
    if (!messageBody) {
        return '';
    }
    if (typeof messageBody === 'string') {
        return messageBody;
    }
    if (typeof messageBody === 'number' || typeof messageBody === 'boolean') {
        return messageBody.toString();
    }
    if (typeof messageBody === 'function') {
        throw new Error('Message body cannot be a function');
    }
    return JSON.stringify(messageBody);
}
export function sleep(seconds) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    });
}
