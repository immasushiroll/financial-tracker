### Feb 19: 
```yarn run start```

feature add:
- total profits across all accounts (or selected accounts)
- summary page first
  - with all accounts current standing
  - recent transactions, gain loss on recent stock transactions
  - different section for most recent month of dividends
    - click in to show different dividends
    - potentially evaluate the valuation of dividends and if u can make more money on this dividends, otherwise, it's the same as a cash account

### Jan 22:
main.js        → owns the data
preload.js    → exposes safe API
renderer.js   → fills the table
index.html    → table layout only

### Jan 19:
Looks good, things are working, no change to current plan, see commit messages, will update if there's a major design change

### Jan 17 current ideation:
store data as jsons for now for easy schema changes and manipulation i.e. flattening, expanding

frontend will be done in electronJS -> what UI screens do i want them to see? what do i want from the UI?
- large bold text, old man can't see
- intuitive, simple interface, with lots of pop up descriptors/tutorials available if he forgets

first try to set up a way such that electronJS can take in user input and store it correctly into a json

see ipad notes for database schema design