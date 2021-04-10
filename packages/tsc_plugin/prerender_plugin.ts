import * as ts from 'typescript';
import { DiagnosticPlugin } from '@bazel/typescript';

export class PrerenderPlugin implements DiagnosticPlugin {
    public readonly name = 'PrerenderPlugin';

    private constructor() { }

    public static of(): PrerenderPlugin {
        return new PrerenderPlugin();
    }

    public getDiagnostics(sourceFile: ts.SourceFile):
            readonly Readonly<ts.Diagnostic>[] {
        return [
            {
                messageText: 'Strict deps violation from rules_prerender!',
                category: ts.DiagnosticCategory.Error,
                code: 0,
                file: sourceFile,
                start: 0,
                length: 5,
            },
        ];
    }
}
