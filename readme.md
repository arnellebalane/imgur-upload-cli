# imgur-upload-cli

Upload images to [imgur.com][1] from the command line.


## Installation

```bash
$ npm install -g imgur-upload-cli
```


## Usage

```bash
$ imgur-upload --help

  Upload images to imgur from the command line

  Upload images:
    $ imgur-upload path/to/image.jpg
    $ imgur-upload path/to/image-one.jpg path/to/image-two.jpg
    $ imgur-upload path/to/*.jpg

  Upload latest image in a directory:
    $ imgur-upload latest path/to/directory
      (if directory is not passed, defaults to the base directory)

  Get base directory:
    $ imgur-upload basedir

  Set base directory:
    $ imgur-upload basedir path/to/base-directory

  View upload history:
    $ imgur-upload history

  Clear upload history:
    $ imgur-upload clear

  Remove uploaded image by deletehash:
    $ imgur-upload remove thedeletehash
      (the deletehash can be obtained from the history command)

  Available options:
    -d, --delete    Delete local image files after they get uploaded
```

### Rate limits

Note there are some [rate limits][limits] with the API.
The daily upload limit is shared by everyone using the same client ID,
so if you're using the provided one and start to get errors,
you might consider using your own client ID, which can be set using an environment variable:

`export IMGUR_CLIENT_ID=xxxxxxxxxxxxxxxx`

[limits]: https://api.imgur.com/#limits

## License

MIT


[1]: http://imgur.com/
