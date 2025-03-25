- strip the input json after parsing, remove all inessential params (as when extending the chat)
    - use the Claude API format here, the "standard" available to me
    - ideally I would like to parse into an initial gitloom leaf node
    
- when editing a message, all the following messsages should be removed (y/n - tree mode related to gitloom)

- add system prompt
    - in extension mode, read system prompt from claude.ai interface

- edit all messages in the history

- gitloom integration
    - UI for displaying, moving around and editing the tree (use git cli from server. create local git repos in client filesystem. sqlite?)
    - allowing managing local gitloom instances

- display cost and token count on screen

- make into a browser extension
   - read chat from network tab 
   - read system prompt, project artifacts
   - project artifacts
   - images / blobs
   - MCP servers

- refactor index.html (move the CSS out)

