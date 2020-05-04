const express = require('express');
const router = express.Router();
const Code = require('../models/Code');

//==========GET ALL THE CODES==========
router.get('/', async (req, res) => {
    
        //ALLOW HEADERS X-REQUEST
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        // if(!req.query.page)
        // {
        //     try {
        //         const codes = await Code.find();

        //         //MAP THROUGH ALL THE CODES, UNPACK THEM AND ADD LINKS
        //         let results = codes.map(code => {
        //             return {
        //                 ...code.toObject(),
        //                 _links: {
        //                     self: {
        //                         href: `http://${req.hostname}:9000/codes/${code._id}`
        //                     },
        //                     collection: {
        //                         href: `http://${req.hostname}:9000/codes/`
        //                     }
        //                 }
        //             }
        //         });

        //         //THE COLLECTION TO RETURN, ADD LINKS AND PAGINATION
        //         let collectionCodes = {
        //             // "codes":{
        //                 // "items":{
        //                     items: results,
        //                 // },
        //                 _links: { self: { href: `http://${req.hostname}:9000/codes/` } },
        //                 pagination: {
        //                     "currentPage": "1",
        //                     "currentItems": "19",
        //                     "totalPages": "1",
        //                     "totalItems": "19",
        //                     "_links": {
        //                         "first": {
        //                         "page": "1",
        //                         "href": "https://docent.cmi.hro.nl/bootb/demo/notes/"
        //                         },
        //                         "last": {
        //                         "page": "1",
        //                         "href": "https://docent.cmi.hro.nl/bootb/demo/notes/"
        //                         },
        //                         "previous": {
        //                         "page": "1",
        //                         "href": "https://docent.cmi.hro.nl/bootb/demo/notes/"
        //                         },
        //                         "next": {
        //                         "page": "1",
        //                         "href": "https://docent.cmi.hro.nl/bootb/demo/notes/"
        //                         }
        //                     }
        //                 }
        //             //}
        //         };

        //     res.status(200).send(collectionCodes)

        //     } catch (error) {
        //         res.status(500).send({ message: error.message || "Oops, something bad happened."});
        //     }
        // }
        // else
        // {

            //==========GET THE PAGE SIZE AND CURRENT PAGE FROM QUERY==========
            const pageSize = req.query.limit ? parseInt(req.query.limit) : 6;
            const currentPage = req.query.page > 0 ? req.query.page -1 : 0;
    
            //==========THE PAGIGINATION "QUERY, GOTTA LOVE THIS ;)==========
            Code.count()
            .then(codeCount => {
                if(currentPage * pageSize > codeCount)
                {
                    res.status(404).send("Oops, something bad happened.");
                }
                Code.find()
                .limit(pageSize)
                .skip(currentPage * pageSize)
                .sort({
                    createdAt: -1
                })
                .then(codes => {
                    res.status(200).send({
                        items: codes.map(code => {
                            return{
                                ...code.toObject(),
                                _links:{
                                    self:{
                                        href: `http://${req.hostname}:9000/codes/${code._id}`
                                    },
                                    collection:{
                                        href: `http://${req.hostname}:9000/codes?page=${(currentPage+1)}&limit=${pageSize}`
                                    }
                                }
                            }
                        }),
                        _links: { self: { href: `http://${req.hostname}:9000/codes/` } },
                        pagination: {
                            "currentPage": (currentPage + 1),
                            "currentItems": pageSize,
                            "totalPages": Math.ceil((codeCount/pageSize)),
                            "totalItems": codeCount,
                            "_links": {
                                "first": {
                                "page": 1,
                                "href": `http://${req.hostname}:9000/codes?page=1&limit=${pageSize}`
                                },
                                "last": {
                                "page": Math.ceil((codeCount/pageSize)),
                                "href": `http://${req.hostname}:9000/codes?page=${Math.ceil((codeCount/pageSize))}&limit=${pageSize}`
                                },
                                "previous": {
                                "page": (currentPage > 1 ? currentPage -1 : 1),
                                "href": `http://${req.hostname}:9000/codes?page=${(currentPage > 1 ? currentPage -1 : 1)}&limit=${pageSize}`
                                },
                                "next": {
                                "page": (currentPage+1 < Math.ceil((codeCount/pageSize)) ? currentPage +2 : currentPage+1),
                                "href": `http://${req.hostname}:9000/codes?page=${(currentPage+1 < Math.ceil((codeCount/pageSize)) ? currentPage +2 : currentPage+1)}&limit=${pageSize}`
                                }
                            }
                        },
                    })
                })
            })
       // }
});

//==========CREATE A CODE==========
router.post('/', async (req, res) => {
    
    //CHECK IF FIELDS ARE EMPTY AND BUILD ERROR OBJECT TO RETURN
    if(!req.body.title || !req.body.description || !req.body.author)
    {
        let errorObject = {};

        if (!req.body.title) 
        {
            errorObject.title = "Title is empty";
        }
        if (!req.body.description)
        {
            errorObject.description = "Description is empty";
        }
        if(!req.body.author)
        {
            errorObject.author = "author is empty";
        }

        res.status(404).send(errorObject);
    }
    else
    {
        try {
            //MAKE THE CODE AND FILL THE FIELDS
            const code = new Code({
                title: req.body.title,
                description: req.body.description,
                author: req.body.author
            });
            
            const result = await code.save();
            
            //EXTRA CHECK JUST BECAUSE ;)
            if(!result)
            {
                res.status(404).send({message: "Code not found."});
            }
            else
            {
                res.status(201).send(result);
            }

        } catch (error) {
            res.status(500).send({message:error || "Oops, something bad happened."});
        }
    }
});

//==========GET SPECIFIC CODE==========
router.get('/:codeId', async (req,res) => {
    try {
        const code = await Code.findById(req.params.codeId);

        //CHECK, IF NOT FOUND RETURN 404 ERROR
        if (!code) {
            res.status(404).send({message: "Code: " + req.params.codeId + " not found."});
        }
        else
        {
            //ALLOW HEADERS X-REQUEST
            res.set("Access-Control-Allow-Origin", "*");
            res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            
            //UNPACK THE CODE AND ADD LINKS
            let result = {
                ...code.toObject(),
                _links: {
                    self: {
                        href: `http://${req.hostname}:9000/codes/${code._id}`
                    },
                    collection: {
                        href: `http://${req.hostname}:9000/codes/`
                    }
                }
            };
                
            res.status(200).send(result);
        }
    } catch (error) {
        res.status(500).send({message:error || "Oops, something bad happened."});
    }
});

//==========DELETE CODE==========
router.delete('/:codeId', async (req, res) =>{
    try {
        const result = await Code.deleteOne({_id: req.params.codeId});    
        
        //EXTRA CHECK JUST BECAUSE ;)
        if (!result) {
            res.status(404).send({message: "Code: " + req.params.codeId + " not found."});
        }
        else
        {
            res.status(204).send(result);
        }
    } catch (error) {
        res.status(500).send({message:error || "Oops, something bad happened."});
    }
});

//==========UPDATE CODE==========
router.put('/:codeId', async (req,res) =>{
    try {
        //CHECK IF FIELDS ARE EMPTY AND BUILD ERROR OBJECT TO RETURN
        if(!req.body.title || !req.body.description || !req.body.author)
        {
            let errorObject = {};

            if(!req.body.title)
            {
                errorObject.title = "Title is empty";
            }
            if(!req.body.description)
            {
                errorObject.description = "Description is empty";
            }
            if(!req.body.author)
            {
                errorObject.author = "Author is empty";
            }

            res.status(404).send(errorObject);
        }
        else
        {
            //DIT WAS EERST EEN PATCH MAAR MOCHT GEEN PATCH GEBRUIKEN VAN DE CHECKER
            //const code = {};

            // if (!req.body.title && req.body.description) 
            // {
            //     const code = await Code.updateOne({_id: req.params.codeId},
            //         {$set:{description: req.body.description}});
                
            //     res.status(200).send(code);
            // }
            // else if (!req.body.description && req.body.title)
            // {
            //     const code = await Code.updateOne({_id: req.params.codeId},
            //         {$set:{title: req.body.title}});
                
            //     res.status(200).send(code);
            // }
            // else if (req.body.description && req.body.title) 
            // {
            //     const code = await Code.updateOne({_id: req.params.codeId},
            //         {$set:{title: req.body.title}},
            //         {$set:{description: req.body.description}});

            //     res.status(200).send(code);
            // } 

             //UPDATE CODE AND FILL THE FIELDS WITH THE NEW AND OLD VALUES
            const code = await Code.updateOne({_id: req.params.codeId}, 
                {
                    $set: {
                        title: req.body.title,
                        description: req.body.description,
                        author: req.body.author
                    }
            });

            //EXTRA CHECK JUST BECAUSE ;)
            if (!code) 
            {
                res.status(404).send({message: "Code: " + req.params.codeId + " not found."});
            }
            else
            {
                res.status(200).send(code);
            }
        }
    } catch (error) {
        res.status(500).send({message:error || "Oops, something bad happened."});
    }
});

//==========ANOTHER ROUTE, NOT NEEDED NOW==========
router.get('/info', (req, res) => {
    res.send('INFO PAGINA');
});

module.exports = router;