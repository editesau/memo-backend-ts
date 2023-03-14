"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MORGAN_ENV = exports.CORS_ORIGIN = exports.APP_HOST = exports.APP_PORT = exports.API_VERSION = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const NODE_ENV = 'dev';
exports.API_VERSION = process.env.API_VERSION || 1;
exports.APP_PORT = Number(process.env.APP_PORT) || 5051;
exports.APP_HOST = NODE_ENV === 'dev' ? 'localhost' : process.env.APP_HOST || 'localhost';
exports.CORS_ORIGIN = process.env.CORS_ORIGIN || 'localhost';
exports.MORGAN_ENV = process.env.MORGAN_ENV || 'dev';
