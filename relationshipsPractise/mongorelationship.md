# REALTIONSHIPS
    SQL (via foreign key)
    -one to one
    table 1                             table 2
    c-id name r-id(foreign key)       r-id(primary key) name    

    -one to many
     ex users and their posts, single user can have multiple posts

     -many to many    (this one , many is known as cardinality)
     (n x n) 


     -one to many (connected with few m one to few)
        implementation- store child document in parent
# WE DONT NEED TO CREATE A NEW MODEL UNTIL WE CANT USE THAT DATA INDIVIDUALLY, LIKE CANT USE A HOME ADDRESS ALSO , IT WILL ALWAYS BE CONNECTED TO A OWNER, SO INTEGRATE THIS WITHIN EXISTING ONE