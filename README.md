# get-summary-from-zaim
A script to get the monthly total amount for each category from [Zaim](https://zaim.net/).
# Usage

```
$ git clone git@github.com:mishiwata1015/get-summary-from-zaim.git
$ cd get-summary-from-zaim
$ yarn install
```

```
$ mv .env.sample .env
$ vim .env # Set your zaim email, password
```

```
$ node index.js
{
  '雑費': [
     6377,  7239,   8997,
     5417,  4597,   2595,
     7472,  8734,   6132,
     8485,  8674,    823
  ],
  '食費': [
    29839, 32890, 42303,
    33642, 37671, 40759,
    39503, 36282, 37613,
    37964, 36425, 40000
  ]
}
```
