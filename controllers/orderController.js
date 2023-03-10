import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';

//@desc Create new order
//@route POST /api/orders
//@access Private
const addOrderItems = asyncHandler(async (req, res) => {
	const {
		orderItems,
		shippingAddress,
		paymentMethod,
		itemsPrice,
		shippingMethod,
		shippingPrice,
		totalPrice,
	} = req.body;
	if (orderItems && orderItems.length === 0) {
		res.status(400);
		throw new Error('Nie wybrano produktów');
		return;
	} else {
		const order = new Order({
			orderItems,
			user: req.user._id,
			shippingAddress,
			paymentMethod,
			itemsPrice,
			shippingMethod,
			shippingPrice,
			totalPrice,
		});
		const createdOrder = await order.save();
		res.status(201).json(createdOrder);
	}
});

//@desc Get order by ID
//@route GET /api/orders/:id
//@access Private
const getOrderById = asyncHandler(async (req, res) => {
	const order = await Order.findById(req.params.id).populate(
		'user',
		'name email'
	);
	if (order) {
		res.json(order);
	} else {
		res.status(404);
		throw new Error('Nie znaleziono zamówienia o podanym id');
	}
});

//@desc update order to paid
//@route GET /api/orders/:id/pay
//@access Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
	const order = await Order.findById(req.params.id);
	if (order) {
		order.isPaid = true;
		order.paidAt = Date.now();
		order.paymentResult = {
			id: req.body.id,
			status: req.body.status,
			update_time: req.body.update_time,
			email_address: req.body.payer.email_address,
		};
		const updatedOrder = await order.save();
		res.json(updatedOrder);
	} else {
		res.status(404);
		throw new Error('Nie znaleziono zamówienia o podanym id');
	}
});

//@desc update order to delivered
//@route PUT /api/orders/:id/deliver
//@access Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
	const order = await Order.findById(req.params.id);
	if (order) {
		order.isDelivered = true;
		order.deliveredAt = Date.now();

		const updatedOrder = await order.save();
		res.json(updatedOrder);
	} else {
		res.status(404);
		throw new Error('Nie znaleziono zamówienia o podanym id');
	}
});

//@desc Get user order list
//@route GET /api/orders/myorders
//@access Private
const getUserOrdersList = asyncHandler(async (req, res) => {
	const orders = await Order.find({ user: req.user._id });
	res.json(orders);
});

//@desc Get orders list
//@route GET /api/orders
//@access Private/Admin
const getAdminOrdersList = asyncHandler(async (req, res) => {
	const orders = await Order.find({}).populate('user', 'id name');
	res.json(orders);
});

export {
	addOrderItems,
	getOrderById,
	updateOrderToPaid,
	getUserOrdersList,
	getAdminOrdersList,
	updateOrderToDelivered,
};
