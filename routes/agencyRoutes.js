/**
 * Định tuyến API quản lý đại lý: /api/agencies/*
 */

const express = require("express");
const agencyService = require("../services/agencyService");
const { asyncHandler } = require("../utils/asyncHandler");

const agencyRouter = express.Router();

/** GET /api/agencies?keyword=&district=&agencyType= - Tra cứu đại lý (UC12, BM3). */
agencyRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const agencies = await agencyService.searchAgencies(req.query);
    res.status(200).json({ total: agencies.length, data: agencies });
  })
);

/** GET /api/agencies/:agencyId - Xem chi tiết đại lý. */
agencyRouter.get(
  "/:agencyId",
  asyncHandler(async (req, res) => {
    const agency = await agencyService.getAgencyById(req.params.agencyId);
    res.status(200).json({ data: agency });
  })
);

/** POST /api/agencies - Tiếp nhận đại lý mới (UC01, BM1, QĐ1). */
agencyRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const createdAgency = await agencyService.receiveAgency(req.body || {});
    res.status(201).json({ message: "Tiếp nhận đại lý thành công", data: createdAgency });
  })
);

/** PUT /api/agencies/:agencyId - Cập nhật thông tin đại lý (UC02). */
agencyRouter.put(
  "/:agencyId",
  asyncHandler(async (req, res) => {
    const updatedAgency = await agencyService.updateAgency(req.params.agencyId, req.body || {});
    res.status(200).json({ message: "Cập nhật đại lý thành công", data: updatedAgency });
  })
);

/** PATCH /api/agencies/:agencyId/deactivate - Ngừng hoạt động đại lý (UC03). */
agencyRouter.patch(
  "/:agencyId/deactivate",
  asyncHandler(async (req, res) => {
    const deactivatedAgency = await agencyService.deactivateAgency(req.params.agencyId);
    res.status(200).json({ message: "Đã ngừng hoạt động đại lý", data: deactivatedAgency });
  })
);

module.exports = agencyRouter;
