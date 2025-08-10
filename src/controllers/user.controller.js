const User = require("../models/user.model");
const Booking = require("../models/booking.model");
const { response } = require("../utils/responseHandler");

const getAllAstrologer = async (req, res) => {
  try {
    const astrologers = await User.find({ role: "astrologer" });

    if (!astrologers || astrologers.length === 0) {
      return response(res, 404, "No Astrologers found");
    }

    return response(res, 200, "Astrologers fetched successfully", astrologers);
  } catch (error) {
    console.error("Error fetching Astrologers:", error);
    return response(res, 500, "Server Error! Could not fetch Astrologers");
  }
};

const getAllUser = async (req, res) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return response(res, 404, "No User Found");
    }

    return response(res, 200, "Astrologers fetched successfully", users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return response(res, 500, "Server Error! Could not fetch users");
  }
};

const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.userId;

    const bookings = await Booking.find({ user: userId }).populate(
      "astrologer"
    );

    if (!bookings.length) {
      return response(res, 200, "No bookings found for this user");
    }

    return response(res, 200, "User bookings fetched successfully", bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return response(
      res,
      500,
      "Server error while fetching bookings",
      error.message
    );
  }
};

const bookAppointmentController = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      astrologerId,
      bookingType,
      date,
      timeSlot,
      durationMinutes,
      totalPrice,
    } = req.body;

    // 1. Validate astrologer
    const astrologer = await User.findById(astrologerId);
    if (!astrologer || astrologer.role !== "astrologer") {
      return response(res, 404, "Astrologer not found or invalid");
    }

    // 2. Convert date to weekday string (e.g., "Monday")
    const bookingDate = new Date(`${date}T00:00:00`);
    const weekday = bookingDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    // 3. Check if astrologer is available on this day
    const isAvailable = astrologer.availability.some(
      (slot) => slot.day.toLowerCase() === weekday.toLowerCase()
    );

    if (!isAvailable) {
      return response(res, 400, `Astrologer not available on ${weekday}`);
    }

    // 4. Optional: Check for overlapping appointments (optional based on your business logic)
    const overlappingBooking = await Booking.findOne({
      astrologer: astrologerId,
      date: bookingDate,
      "timeSlot.startTime": { $lt: timeSlot.endTime },
      "timeSlot.endTime": { $gt: timeSlot.startTime },
    });

    if (overlappingBooking) {
      return response(res, 400, "Time slot already booked");
    }

    // 5. Create new booking
    const newBooking = new Booking({
      user: userId,
      astrologer: astrologerId,
      bookingType,
      date: bookingDate,
      timeSlot,
      durationMinutes,
      totalPrice,
    });

    await newBooking.save();
    console.log("Booking Date:", bookingDate);
    console.log("Weekday Calculated:", weekday);
    console.log(
      "Astrologer Availability:",
      astrologer.availability.map((d) => d.day)
    );
    return response(res, 201, "Appointment booked successfully", newBooking);
  } catch (error) {
    console.error("Error booking appointment:", error);
    return response(
      res,
      500,
      "Server error while booking appointment",
      error.message
    );
  }
};

module.exports = {
  getAllAstrologer,
  getUserBookings,
  bookAppointmentController,
  getAllUser,
};
