import { ConsoleSink, ConsoleSinkOptions, LogEvent } from "serilogger";

/**
 * ProxyInterface für die Console zum ausgeben von Nachrichten
 */
export interface ConsoleProxy {
    // #region error
    /**
     * Outputs an error message. You may use string substitution and additional arguments with this method
     * 
     * @param message The message to display in the console.
     * 
     * %o or %O >
     * Outputs a JavaScript object. Clicking the object name opens more information about it in the inspector.
     * 
     * %d or %i >
     * Outputs an integer. Number formatting is supported, for example  console.log("Foo %.2d", 1.1) will 
     * output the number as two significant figures with a leading 0: Foo 01
     * 
     * %s >
     * Outputs a string.
     * 
     * %f >
     * Outputs a floating-point value. Formatting is supported, for example  console.log("Foo %.2f", 1.1) will 
     * output the number to 2 decimal places: Foo 1.10 
     * 
     * %c >
     * Sets a style for the folowing text. For example console.log("%cThis Text is Red", 
     * "Backgroundcolor: Red, Color: Black") will output black text with red background
     * 
     * @param properties A list of JavaScript objects to output. The string representations 
     * of each of these objects are appended together in the order listed and output. Please 
     * be warned that if you log objects in the latest versions of Chrome and Firefox what 
     * you get logged on the console is a reference to the object, which is not necessarily 
     * the 'value' of the object at the moment in time you call console.log(), but it is 
     * the value of the object at the moment you open the console.
     */
    error(message?: any, ...properties: any[]): any;
    // #endregion

    // #region warn
    /**
     * Outputs a warning message. You may use string substitution and additional arguments with this method.
     * 
     * @param message The message to display in the console.
     * 
     * %o or %O >
     * Outputs a JavaScript object. Clicking the object name opens more information about it in the inspector.
     * 
     * %d or %i >
     * Outputs an integer. Number formatting is supported, for example  console.log("Foo %.2d", 1.1) will 
     * output the number as two significant figures with a leading 0: Foo 01
     * 
     * %s >
     * Outputs a string.
     * 
     * %f >
     * Outputs a floating-point value. Formatting is supported, for example  console.log("Foo %.2f", 1.1) will 
     * output the number to 2 decimal places: Foo 1.10 
     * 
     * %c >
     * Sets a style for the folowing text. For example console.log("%cThis Text is Red", 
     * "Backgroundcolor: Red, Color: Black") will output black text with red background
     * 
     * @param properties A list of JavaScript objects to output. The string representations 
     * of each of these objects are appended together in the order listed and output. Please 
     * be warned that if you log objects in the latest versions of Chrome and Firefox what 
     * you get logged on the console is a reference to the object, which is not necessarily 
     * the 'value' of the object at the moment in time you call console.log(), but it is 
     * the value of the object at the moment you open the console.
     */
    warn(message?: any, ...properties: any[]): any;
    // #endregion

    // #region info
    /**
     * Informative logging of information. You may use string substitution and additional arguments with this method.
     * 
     * @param message The message to display in the console.
     * 
     * %o or %O >
     * Outputs a JavaScript object. Clicking the object name opens more information about it in the inspector.
     * 
     * %d or %i >
     * Outputs an integer. Number formatting is supported, for example  console.log("Foo %.2d", 1.1) will 
     * output the number as two significant figures with a leading 0: Foo 01
     * 
     * %s >
     * Outputs a string.
     * 
     * %f >
     * Outputs a floating-point value. Formatting is supported, for example  console.log("Foo %.2f", 1.1) will 
     * output the number to 2 decimal places: Foo 1.10 
     * 
     * %c >
     * Sets a style for the folowing text. For example console.log("%cThis Text is Red", 
     * "Backgroundcolor: Red, Color: Black") will output black text with red background
     * 
     * @param properties A list of JavaScript objects to output. The string representations 
     * of each of these objects are appended together in the order listed and output. Please 
     * be warned that if you log objects in the latest versions of Chrome and Firefox what 
     * you get logged on the console is a reference to the object, which is not necessarily 
     * the 'value' of the object at the moment in time you call console.log(), but it is 
     * the value of the object at the moment you open the console.
     */
    info(message?: any, ...properties: any[]): any;
    // #endregion

    // #region debug
    /**
     * Outputs a message to the console with the log level debug
     * 
     * @param message The message to display in the console.
     * 
     * %o or %O >
     * Outputs a JavaScript object. Clicking the object name opens more information about it in the inspector.
     * 
     * %d or %i >
     * Outputs an integer. Number formatting is supported, for example  console.log("Foo %.2d", 1.1) will 
     * output the number as two significant figures with a leading 0: Foo 01
     * 
     * %s >
     * Outputs a string.
     * 
     * %f >
     * Outputs a floating-point value. Formatting is supported, for example  console.log("Foo %.2f", 1.1) will 
     * output the number to 2 decimal places: Foo 1.10 
     * 
     * %c >
     * Sets a style for the folowing text. For example console.log("%cThis Text is Red", 
     * "Backgroundcolor: Red, Color: Black") will output black text with red background
     * 
     * @param properties A list of JavaScript objects to output. The string representations 
     * of each of these objects are appended together in the order listed and output. Please 
     * be warned that if you log objects in the latest versions of Chrome and Firefox what 
     * you get logged on the console is a reference to the object, which is not necessarily 
     * the 'value' of the object at the moment in time you call console.log(), but it is 
     * the value of the object at the moment you open the console.
     */
    debug(message?: any, ...properties: any[]): any;
    // #endregion

    // #region log
    /**
     * The method outputs a message to the web console
     * 
     * @param message The message to display in the console.
     * 
     * %o or %O >
     * Outputs a JavaScript object. Clicking the object name opens more information about it in the inspector.
     * 
     * %d or %i >
     * Outputs an integer. Number formatting is supported, for example  console.log("Foo %.2d", 1.1) will 
     * output the number as two significant figures with a leading 0: Foo 01
     * 
     * %s >
     * Outputs a string.
     * 
     * %f >
     * Outputs a floating-point value. Formatting is supported, for example  console.log("Foo %.2f", 1.1) will 
     * output the number to 2 decimal places: Foo 1.10 
     * 
     * %c >
     * Sets a style for the folowing text. For example console.log("%cThis Text is Red", 
     * "Backgroundcolor: Red, Color: Black") will output black text with red background
     * 
     * @param properties A list of JavaScript objects to output. The string representations 
     * of each of these objects are appended together in the order listed and output. Please 
     * be warned that if you log objects in the latest versions of Chrome and Firefox what 
     * you get logged on the console is a reference to the object, which is not necessarily 
     * the 'value' of the object at the moment in time you call console.log(), but it is 
     * the value of the object at the moment you open the console.
     */
    log(message?: any, ...properties: any[]): any;
    // #endregion
}

export interface ColoredConsoleSinkOptions extends ConsoleSinkOptions
{
    sinkColors?: ColoredConsoleSinkColors;
}

export const defaultConsoleSinkColors: ColoredConsoleSinkColors = 
{
    "Fatal":
    {
        levelBackgroundColor: "#EE0000",
        parameterBackgroundColor: "#EE0000"
    },
    "Error":
    {
        levelBackgroundColor: "#770000",
        parameterBackgroundColor: "#770000"
    },
    "Warning":
    {
        levelBackgroundColor: "#666600",
        parameterBackgroundColor: "#666600"
    },
    "Information":
    {
        levelBackgroundColor: "#007700",
        parameterBackgroundColor: "#007700"
    },
    "Debug":
    {
        levelBackgroundColor: "#008888",
        parameterBackgroundColor: "#007777"
    },
    "Verbose":
    {
        levelBackgroundColor: "#000088",
        parameterBackgroundColor: "#000077"
    },
    "Log":
    {
        levelBackgroundColor: "#660066",
        parameterBackgroundColor: "#660066"
    }
};

export interface ConsoleSinkColors
{
    levelForegroundColor?: string;
    levelBackgroundColor: string;
    backgroundColor?: string;
    foregroundColor?: string;
    parameterBackgroundColor: string;
    parameterForegroundColor?: string;
}

export interface ColoredConsoleSinkColors
{
    [logLevel: string]: ConsoleSinkColors
}

export class BrowserColoredConsoleSink extends ConsoleSink 
{
    // #region fields
    protected sinkColors: ColoredConsoleSinkColors;
    // #endregion

    // #region ctor
    public constructor(options?: ColoredConsoleSinkOptions)
    {
        super(options);

        let optionsSinkColors = {};

        if (typeof options === "object")
        {
            if (typeof options.sinkColors === "object")
            {
                optionsSinkColors = options.sinkColors;
            }
        }

        this.sinkColors = Object.assign(optionsSinkColors, defaultConsoleSinkColors);
    }
    // #endregion

    // #region writeToConsole
    protected override writeToConsole(
        logMethod: (message?: any, ...properties: any[]) => void, 
        prefix: string, 
        event: LogEvent) 
    {
        let output: string = "";
        let consoleParameters: Array<any> = new Array<any>();
        let sinkColorsForThisLevel = this.sinkColors[prefix];
        
        if (this.options.includeTimestamps)
        {
            output += event.timestamp + " ";
        }

        if (this.options.removeLogLevelPrefix == false)
        {
            output += `[%c${prefix}%c] `;
            let parameterText: string = "";

            if (typeof sinkColorsForThisLevel.levelBackgroundColor === "string")
            {
                parameterText += `Background: ${sinkColorsForThisLevel.levelBackgroundColor};`;
            }
            if (typeof sinkColorsForThisLevel.levelForegroundColor === "string")
            {
                parameterText += `Color: ${sinkColorsForThisLevel.levelForegroundColor};`;
            }

            consoleParameters.push(parameterText);
            consoleParameters.push("");
        }

        let parameterPattern = new RegExp("{.+?}");
        output += event.messageTemplate.raw;
        let tokens = new Array<string>();
        let match: RegExpMatchArray;

        for (const key in event.properties)
        {
            let replaceText: string = "%c";
            let parameterText: string = "";
            if (typeof sinkColorsForThisLevel.parameterBackgroundColor === "string")
            {
                parameterText += `Background: ${sinkColorsForThisLevel.parameterBackgroundColor};`;
            }
            if (typeof sinkColorsForThisLevel.parameterForegroundColor === "string")
            {
                parameterText += `Color: ${sinkColorsForThisLevel.parameterForegroundColor};`;
            }
            consoleParameters.push(parameterText);

            switch (typeof event.properties[key])
            {
                case "string":
                    replaceText += "%s";
                    break;
                case "number":
                    if (event.properties[key] % 1 > 0)
                    {
                        replaceText += "%f";
                    }
                    else
                    {
                        replaceText += "%i";
                    }
                    break;
                case "object":
                    replaceText += "%o";
                    break;
                default:
                    replaceText += "%s";
                    break;
            }
            consoleParameters.push(event.properties[key]);

            replaceText += "%c";
            consoleParameters.push("");

            output = output.replace(`{${key}}`, replaceText);
        }

        if (typeof event.error !== "undefined")
        {
            output += " Error: %o";
            consoleParameters.push(event.error);
        }

        logMethod(output, ...consoleParameters);
    }
    // #endregion
}