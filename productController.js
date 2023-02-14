
import { product } from '../models'

import multer from 'multer';

import path from 'path'

import {CustomErrorHandler} from '../services'
import Joi from 'joi';

import fs from 'fs';
//import { APP_URL } from '../config';


const storage = multer.diskStorage({

	destination: (req, file, cb) => cb(null, 'upload/'),
	
	filename: (req, file, cb) => {
		
		const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;

		cb(null,uniqueName)

	}
	

})

const handleMultipartData=multer({storage,limits:{fieldSize:1000000*5}}).single('image')  //5mb

const productController = {

	async store(req, res, next) {
		
		//multipart form data

		handleMultipartData(req, res, async(err) => {
			
			if(err) {
				
				return next(CustomErrorHandler.serverError('Internal server error'))


			}

			//console.log(req.file);
   
			const filePath = req.file.path;

			//validation

			const productSchema = Joi.object({

				name: Joi.string().required(),
				price: Joi.number().required(),
				size:Joi.string().required(),
				
			})

			const { error } = productSchema.validate(req.body)
			


			if (error) {

				//Delete the uploaded file

				fs.unlink(`${appRoot}/${filePath}`,  (err) => {
					
					return next(CustomErrorHandler.serverError('file not delete create  a problem '))
				})

				return next(CustomErrorHandler.serverError('validation error'))

				//rootfolder/upload/filename.png
				

			}

			const { name, price, size } = req.body;

			let document;

			try {

				document = await product.create({
					name,
					price,
					size,
					image:filePath,
				})
				
			} catch (err) {

				return next(err)
				
			}




			res.status(201).json({document})

		})



	},

	async update(req, res, next) {


		      // Multipart form data
        handleMultipartData(req, res, async (err) => {
									if (err) {
													
													return next(CustomErrorHandler.serverError("Internal server error"));
													
									}
									
									let filePath;

									if (req.file) {

										 filePath = req.file.path;
														
									}
            // validation
									
									const productSchema = Joi.object({
										name: Joi.string().required(),
										price: Joi.number().required(),
										size: Joi.string().required(),
										image:Joi.string(),
										
									})
									
									
									const { error } = productSchema.validate(req.body);
									

									
									if (error) {
													
										if (req.file) {
											// Delete the uploaded file
											fs.unlink(`${appRoot}/${filePath}`, (err) => {
												if (err) {
													return next(
														CustomErrorHandler.serverError('problem create the deletion file')
													);
												}
											});
										}

                return next(error);
                // rootfolder/uploads/filename.png
            }

            const { name, price, size } = req.body;
            let document;
            try {
                document = await product.findOneAndUpdate({_id:req.params.id},{
                    name,
                    price,
                    size,
                    ...(req.file && {image:filePath})
                },{new:true});
            } catch (err) {
                return next(err);
            }
            res.status(201).json(document);
        });
		
		
		
	},
	async distroy(req, res, next) {
		const document = await product.findOneAndRemove({ _id: req.params.id });
		
		if (!document) {

			return next(new Error('Nothing to delete'));

			

		}

		//image delete

		const imagePath = document._doc.image;


		fs.unlink(`${appRoot}/${imagePath}`, (err) => {
			
			if (err) {
			
				return next(new Error('Internal server error'));

		}

		})

		res.json(document);
		
	},
	async list(req, res, next) {
		
		let documents;

		// pagination

		try {

			documents = await product.find().select('-updatedAt -__v').sort({_id:-1});
			
		} catch (err) {
			
			return next(err);
		}

		res.json(documents);
		
	},
	async search(req, res, next) {
		
		let document;
		try {

document = await product.findOne({_id:req.params.id}).select('-updatedAt -__v')
			

		} catch (err) {

			return next(CustomErrorHandler.serverError("Internal server error"))
			
		}

		return res.json(document)
		
	}
	





}

export default productController;
