## CSV to JSON converter

How to run
- Add database details in .env else sequalize exception will occur
- Configure file path in .env (you use one of the files from ./files)
- then execute the following command
- after executing will see the progress in the console

```sh
$ npm start
```

Features and Results
- CSV to JSON with nested JSON capability
- Tested with 12lakhs records 
- Implemented using event emitter to handle large data set
- Utilize file streaming to reduce memory consumption
- Handle required edge scenarios like to check the header, content, etc

## Screenshots
