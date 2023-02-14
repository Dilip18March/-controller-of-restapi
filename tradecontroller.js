import { Trade } from "../models";
import { CustomErrorHandler } from "../services"

const tradecontroller = {

	async trades(req, res, next) {

		const { symbol, shares, price } = req.body;

		if (!symbol || !shares || !price) {

			return next(CustomErrorHandler.notFound('symbol shares and price are not found'))
			 
		}

	
		const trade = await Trade.create({symbol,shares,price})


		if (trade) {

			return res.json({symbol:symbol , shares:shares,price:price})
	

		}

		  res.json({message:'trade not  found'})

		


	}
  

}

export default tradecontroller