# promisify-loader-runner

This is a promisify method of `loader-runner` <https://github.com/webpack/loader-runner>

and you can use both `promisify` or `callback` calling style

## Usage

### Promise

```js
import { runLoaders } from "promisify-loader-runner";

try {
  const result = await runLoaders({
    resource: "/abs/path/to/file.txt?query",
    loaders: ["/abs/path/to/loader.js?query"],
    context: { minimize: true },
    processResource: (loaderContext, resourcePath, callback) => { ... },
    readResource: fs.readFile.bind(fs)
  })
} catch (err){
  // err: Error?
}
```

### Callback (original way)

```js
import { runLoaders } from "promisify-loader-runner";

runLoaders({
 resource: "/abs/path/to/file.txt?query",
 // String: Absolute path to the resource (optionally including query string)

 loaders: ["/abs/path/to/loader.js?query"],
 // String[]: Absolute paths to the loaders (optionally including query string)
 // {loader, options}[]: Absolute paths to the loaders with options object

 context: { minimize: true },
 // Additional loader context which is used as base context

 processResource: (loaderContext, resourcePath, callback) => { ... },
 // Optional: A function to process the resource
 // Must have signature function(context, path, function(err, buffer))
 // By default readResource is used and the resource is added a fileDependency

 readResource: fs.readFile.bind(fs)
 // Optional: A function to read the resource
 // Only used when 'processResource' is not provided
 // Must have signature function(path, function(err, buffer))
 // By default fs.readFile is used
}, function(err, result) {
 // err: Error?

 // result.result: Buffer | String
 // The result
 // only available when no error occurred

 // result.resourceBuffer: Buffer
 // The raw resource as Buffer (useful for SourceMaps)
 // only available when no error occurred

 // result.cacheable: Bool
 // Is the result cacheable or do it require reexecution?

 // result.fileDependencies: String[]
 // An array of paths (existing files) on which the result depends on

 // result.missingDependencies: String[]
 // An array of paths (not existing files) on which the result depends on

 // result.contextDependencies: String[]
 // An array of paths (directories) on which the result depends on
})
```
