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
```


## License

MIT


[1]: http://imgur.com/
