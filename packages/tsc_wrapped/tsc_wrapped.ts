import * as ts from 'typescript';

const runfiles = require(process.env['BAZEL_NODE_RUNFILES_HELPER']!);

interface RulesPrerenderConfig extends ts.ParsedTsconfig {
    rulesPrerenderOptions?: {
        files: string[];
    };
}

(async () => {
    const tsconfigFile = process.argv[2];
    
    const { config: rawConfig, error } =
        ts.readConfigFile(tsconfigFile, ts.sys.readFile);
    if (error) throw error;

    const config = rawConfig as RulesPrerenderConfig;
    const { rulesPrerenderOptions } = config;
    if (!rulesPrerenderOptions) {
        throw new Error('tsconfig does not contain `rulesPrerenderOptions`.');
    }
    const { files: fileRelPaths } = rulesPrerenderOptions;

    const files = fileRelPaths.map((relPath) => runfiles.resolve(relPath));

    const host = ts.createCompilerHost(config.options ?? {});
    const program = ts.createProgram(files, config.options ?? {}, host);
    const sources = program.getSourceFiles().filter((file) => files.some((src) => file.fileName.includes(src)));
    const transformer = <T extends ts.Node>(context: ts.TransformationContext) => {
        return (rootNode: T) => {
            function visit(node: ts.Node): ts.Node {
                if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
                    console.log(`Invoked: ${node.expression.escapedText}`);
                }
                return ts.visitEachChild(node, visit, context);
            }
            return ts.visitNode(rootNode, visit);
        };
    };
    ts.transform(sources, [ transformer ]);
    const result = program.emit();

    const diagnostics =
        ts.getPreEmitDiagnostics(program).concat(result.diagnostics);
    for (const diagnostic of diagnostics) {
        console.log(ts.flattenDiagnosticMessageText(
            diagnostic.messageText, '\n'));
    }
})();
