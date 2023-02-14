import Joi from "joi"
import { REFRSH_SECRET } from "../../config";
import { RefreshToken, User } from "../../models";
import { CustomErrorHandler, JwtService } from "../../services";

const refreshController = {

	async refresh(req,res,next) {

		//validation

		const refreshSchema = Joi.object({

			refresh_token: Joi.string().required(),

		});

		const { error } = refreshSchema.validate(req.body);

		if (error) {

			return next(error);
			
		}

		//database

		let refreshtoken;

		try {
    
			refreshtoken = await RefreshToken.findOne({ token: req.body.refresh_token });

			if (!refreshtoken) {
				
				return next(CustomErrorHandler.unAuthorized('Invailed refresh_token'))
			}

			let userId;

			try {

				const { _id } = await JwtService.verify(refreshtoken.token, REFRSH_SECRET)
				
				userId = _id;
				
			} catch (err) {

				return next(CustomErrorHandler.unAuthorized('Not valid refresh_token'));

				
			}

			const user = await User.findOne({ _id: userId });

			if (!user) {
				
				return next(CustomErrorHandler.unAuthorized('user not found'));

			}


			// Toekn
const access_token = JwtService.sign({ _id: user._id, role: user.role });
const   refresh_token = JwtService.sign({ _id: user._id, role: user.role },'1y', REFRSH_SECRET)
//database whitelist
            
 await RefreshToken.create({token:refresh_token})
res.json({ access_token,refresh_token});

			
		}


		catch (err) {
			return next(err);
		}



		

		
			
		
			
			
		
		
	}



	
}
export default refreshController