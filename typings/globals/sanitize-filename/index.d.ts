// Generated by typings
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/7de6c3dd94feaeb21f20054b9f30d5dabc5efabd/sanitize-filename/sanitize-filename.d.ts
declare module "sanitize-filename" {
	function sanitize(filename: string, options?: sanitize.Options): string;

	namespace sanitize {
		interface Options {
			replacement: string;
		}
	}

	export = sanitize;
}