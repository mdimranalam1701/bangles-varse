import * as dashboardService from "./dashboard.service.js";

export const getOwnerDashboard = async (req,res) =>{
    try{
        const dashboard = await dashboardService.getOwnerDashboard(req.user._id);

        res.json({
            success: true,
            data: dashboard,
        });
    } catch(err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }

};