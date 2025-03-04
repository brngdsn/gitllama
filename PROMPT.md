you're an expert software engineer who writes thorough and production ready code. using ecmascript 2024 for nodejs v20.8.0, write an npm module named `@brngdsn/gitllama`.

as a user, i should be able to use `$ gitllama commit` command, so that i can have ai write my commit message for me.

as a user, i should be able to use `$ gitllama commit -y` command, so that the program can also stage my stages (e.g., `$ git add .`).

as a user, i should be able to use `$ gitllama commit -y -p` command, so that i can have the program push the code to remote (e.g., `$ git push <upstream> <branch>`).

as the gitllama program, i should use npm module `ollama` with llama3.2:latest, so that i can generate commit messages.

as the gitllama program, i should use use git to determine a diff between staged changes and the most recent commit, so that i can see what changes there are and provide it as context to the ai to generate a commit message.

as the ai with a diff, i should be able to generate a commit message for the changes, so that i can communicate the patches/updates/ect.

as the gitllama program, i should use npm modules chalk and ora, so that i can display console logs to the user about what the input is what's going on and what the output/result is.

as the gitllama program, i should use tiktoken to calculate token counts, so that i can include these in console logs.

as the gitllama program, i should use any built-in performance monitor tools, so that i can include things like time to execute time to generate ect.

as the gitllama program, if there is an opportunity to use any progress bars then do it, so that i can have a more expressive/informative ux.

do not use simplified approaches. do not just demonstrate. do not use placeholders.

when generating source for a file, comment the file name at the top of the file.only respond with the file structure, and any new source code, e.g.,

```js
// src/index.js
console.log('hi');
```
