"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = require("http");
const morgan_1 = __importDefault(require("morgan"));
const constants_1 = require("./helpers/constants");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// connect middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: constants_1.CORS_ORIGIN,
    credentials: true,
}));
app.use((0, morgan_1.default)(constants_1.MORGAN_ENV));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
httpServer.listen(constants_1.APP_PORT, constants_1.APP_HOST, () => {
    console.log(`Server started on ${constants_1.APP_HOST}:${constants_1.APP_PORT}`);
});
