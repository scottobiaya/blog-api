var express = require('express');
const Blog = require('../models/blog');
const authMiddleware = require('../middlewares/auth');
const { findByIdAndUpdate } = require('../models/blog');
var blogRouter = express.Router();


/* Get Blogs */
blogRouter.get('', async function(req, res, next) {
  
  try{

    const { page = 1, limit = 20 } = req.query;

    // execute query with page and limit values
    const blogs = await Blog.find({ state : 'published' }).populate('author')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // get total documents in the Posts collection 
    const count = await Blog.countDocuments();

    // return response with posts, total pages, and current page
    return res.status(200).json({
      blogs,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });

  }catch (err){
    console.log(err);
    res.status(400).send({
      message: 'Something went wrong, please contact the admin'
    })
  }

});


/** Create Blog  */
blogRouter.post('/createBlog', authMiddleware, async function(req, res, next) {
    try{
      // input
    const { 
      title,
      description,
      tags,
      readingTime,
      body
    } = req.body;

    // Validate user input
    if (!(title && description && tags && readingTime && body)) {
      return res.status(400).send({
        message: 'Please provide all required fields'
      });
    }

    // Create user in our database
    const blog = await Blog.create({
      title,
      description,
      tags,
      readingTime,
      body,
      state: 'draft',
      author: req.user.user_id
    });

      // return new user
      return res.status(201).json(blog);
    }catch (err){
      console.log(err);
      return res.status(400).json({'message': 'An Error occured, please contact admin'}); 
    }
  });

/** get published blogs for not logged in users */
blogRouter.get('/:id', authMiddleware, async function(req, res, next){
  const { id } = req.params;

  const blog = await Blog.findById(id).populate('author');

  if (!blog){
    return res.status(404).json({
      message: 'Not found',
    });
  }

  console.log(req.user);

  if (blog.state == 'draft' && req.user == null){
    return res.status(400).json({
      message: 'This document is in draft state, if you are the owner of this document, you need to login',
    });
  }

  return res.status(200).json({
    message: 'success',
    blog
  })

})

/** allow users that are logged in to update thier own blog */
/** this endpoint also allows the author of the blog, switch from draft state to published */
blogRouter.put('/:id/update', authMiddleware, async function(req, res, next){
  const { id } = req.params;


  const blog = await Blog.findById(id)

  console.log(req.user);

  if (blog) {

    if ((blog.author != req.user.user_id)){
      return res.status(400).json({
        message: 'You cannot edit this blog, because you are not the author',
      });  
    }


    blog.title = req.body.title ? req.body.title : blog.title;
    blog.description = req.body.description ? req.body.description : blog.description;
    blog.tags = req.body.tags ? req.body.tags : blog.tags;
    blog.body = req.body.body ? req.body.body : blog.body;
    blog.state = req.body.state ? req.body.state : blog.state;

    blog.save();

    return res.status(200).json({
      message: 'blog updated successfully',
      blog
    });
  }

  return res.status(404).json({
    message: 'Not Found'
  })

})

/** allow users that are logged in to delete thier own blog */
blogRouter.delete('/:id/delete', authMiddleware, async function(req, res, next){
  const { id } = req.params;


  const blog = await Blog.findById(id)

  console.log(req.user);

  if (blog) {

    if ((blog.author != req.user.user_id)){
      return res.status(400).json({
        message: 'You cannot edit this blog, because you are not the author',
      });  
    }

    blog.delete();
   

    return res.status(200).json({
      message: 'blog deleted successfully'
    });
  }

  return res.status(404).json({
    message: 'Not Found'
  })

})

module.exports = blogRouter;
