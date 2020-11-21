"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var discord_js_1 = require("discord.js");
var client = new discord_js_1.Client();
client.on('ready', function () { return console.log('ready'); });
client.on('message', function (message) { return __awaiter(void 0, void 0, void 0, function () {
    var mes, mes0, mes1, mes2, mes3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (message.author.bot)
                    return [2 /*return*/];
                console.log(message.content);
                if (message.content !== '!calc' && message.content !== '!ping')
                    return [2 /*return*/];
                if (!(message.content === '!ping')) return [3 /*break*/, 2];
                return [4 /*yield*/, message.channel.send('pinging')];
            case 1:
                mes = _a.sent();
                return [2 /*return*/, mes.edit("ws:" + client.ws.ping + "\nmes:" + (mes.createdAt.getUTCMilliseconds() - message.createdAt.getUTCMilliseconds()))];
            case 2: return [4 /*yield*/, message.channel.send('```初期化中....  （電卓を開いて計算した方が早いよ）    \n```')];
            case 3:
                mes0 = _a.sent();
                return [4 /*yield*/, message.channel.send('```\n```')];
            case 4:
                mes1 = _a.sent();
                return [4 /*yield*/, message.channel.send('```\n```')];
            case 5:
                mes2 = _a.sent();
                return [4 /*yield*/, message.channel.send('```\n```')];
            case 6:
                mes3 = _a.sent();
                return [4 /*yield*/, Promise.all([mes0.react('7️⃣'), mes1.react('4️⃣'), mes2.react('1️⃣'), mes3.react('0️⃣')])];
            case 7:
                _a.sent();
                return [4 /*yield*/, Promise.all([mes0.react('8️⃣'), mes1.react('5️⃣'), mes2.react('2️⃣'), mes3.react('➕')])];
            case 8:
                _a.sent();
                return [4 /*yield*/, Promise.all([mes0.react('9️⃣'), mes1.react('6️⃣'), mes2.react('3️⃣'), mes3.react('➖')])];
            case 9:
                _a.sent();
                return [4 /*yield*/, Promise.all([mes0.react('◀️'), mes1.react('➗'), mes2.react('✖️')])];
            case 10:
                _a.sent();
                new Calculator(mes0, mes1, mes2, mes3);
                return [2 /*return*/];
        }
    });
}); });
var defaultReactions = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '➕', '➖', '✖️', '➗', '◀️'];
// eslint-disable-next-line no-shadow
var reactionsToString;
(function (reactionsToString) {
    reactionsToString["0\uFE0F\u20E3"] = "0";
    reactionsToString["1\uFE0F\u20E3"] = "1";
    reactionsToString["2\uFE0F\u20E3"] = "2";
    reactionsToString["3\uFE0F\u20E3"] = "3";
    reactionsToString["4\uFE0F\u20E3"] = "4";
    reactionsToString["5\uFE0F\u20E3"] = "5";
    reactionsToString["6\uFE0F\u20E3"] = "6";
    reactionsToString["7\uFE0F\u20E3"] = "7";
    reactionsToString["8\uFE0F\u20E3"] = "8";
    reactionsToString["9\uFE0F\u20E3"] = "9";
    reactionsToString["\u2795"] = "+";
    reactionsToString["\u2796"] = "-";
    reactionsToString["\u2716\uFE0F"] = "\u00D7";
    reactionsToString["\u2797"] = "\u00F7";
    reactionsToString["\u25C0\uFE0F"] = "<";
})(reactionsToString || (reactionsToString = {}));
var filter = function (reaction, user) { return user !== client.user; };
var Calculator = /** @class */ (function () {
    function Calculator(message, mes1, mes2, mes3) {
        this.message = message;
        this.formula = '';
        this.startCollecting(message);
        this.startCollecting(mes1);
        this.startCollecting(mes2);
        this.startCollecting(mes3);
        message.edit('```0\n```');
    }
    Calculator.prototype.startCollecting = function (message) {
        var _this = this;
        var collector = message.createReactionCollector(filter);
        collector.on('collect', function (reaction, user) { return _this.handleReaction(reaction, user); });
    };
    Calculator.prototype.handleReaction = function (reaction, user) {
        if (!defaultReactions.includes(reaction.emoji.name))
            return reaction.users.remove(user);
        if (this.formula === '' && (isNaN(Number(reactionsToString[reaction.emoji.name])) || reaction.emoji.name === '0️⃣'))
            return reaction.users.remove(user);
        var lastString = this.formula.slice(-1);
        if (reactionsToString[reaction.emoji.name] === '<') {
            this.formula = this.formula.substring(0, this.formula.length - 1);
            if (this.formula.slice(-1) === ' ')
                this.formula = this.formula.substring(0, this.formula.length - 1);
        }
        else {
            if (isNaN(Number(lastString)) && isNaN(Number(reactionsToString[reaction.emoji.name])))
                return reaction.users.remove(user);
            if (isNaN(Number(lastString)) && !isNaN(Number(reactionsToString[reaction.emoji.name])))
                this.formula += ' ';
            if (isNaN(Number(reactionsToString[reaction.emoji.name])))
                this.formula += ' ';
            this.formula += reactionsToString[reaction.emoji.name];
        }
        try {
            var result = eval(this.formula.replace(/×/g, '*').replace(/÷/g, '/'));
            if (result == this.formula || !result) {
                this.message.edit("```" + (this.formula === '' ? 0 : this.formula) + "\n```");
            }
            else {
                this.message.edit("```" + this.formula + " = " + result + "\n```");
            }
        }
        catch (_a) {
            this.message.edit("```" + this.formula + "\n```");
        }
        finally {
            reaction.users.remove(user);
        }
    };
    return Calculator;
}());
client.login()["catch"](console.error);
