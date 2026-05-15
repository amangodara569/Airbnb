//theory  for middlewares
request ===> middleware =====> response

# definition
    are functions that come into play after the server receives the request and before the response is sent to the client, do some type of wrok in between , like method override package, 
    express.static , express.urlencoded 

# what middlewares can do
    ==middlewares can access and make changes to req, res objects
    ==can form chains of multiple middlewares
    ==execute any code
    == end the req, res cycle

# code structure
    app.use((req, res)=>{
        console.log("hi i am middlefinger");
        res.send("hi");
    })

# its work
    can perform two taks , 
        either give reponse which is specified
        or call next middleware

# go to express/request page to get to know more about it

# dont write middlewares at last , they dont work, if it has to work for all path , then at first or for a particular then just before that path

# error handling middleware
    app.use((err, req, res, next)=>{
        console.log("error);
        next() ; 
        //if we call next in them , if will directly call non error handling middleware
        //can also pass error
        next(err);//triggers express default error handler
    })

    next() = means we are calling normal middleware
    next(err) = calling error handling middleware