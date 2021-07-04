# Abbreviations and Comments

### Relating to null/undefined

I have TypeScript's `strictNullChecks` option enabled in my projects. This means there are a number of patterns I've developed for "making the null-checker happy".

Some examples:
```
// if something should be nullable, just add "|n" at the end of the type
let myVar: string|n;

// if you're calling a func that sometimes can return null, but you know it won't, explain it with a comment of the form below
const result = CallWhichIKnowWillNotReturnNull()!; // nn: db-ref, bail
// Explanation:
// * nn: "marked as non-null [ie. the exclamation point], because..."
// * db-ref: "the database contains a foreign-key constraint for this field, ensuring that its target exists"
// * bail: "for any null-result from data still loading, a bail-error would throw that bubbles past the current func; thus, we can safely treat it as always non-null"
```