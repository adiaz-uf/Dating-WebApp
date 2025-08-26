import React, { useState } from "react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

interface CreateEventModalProps {
  onClose?: () => void;
  onSchedule?: (eventData: { name: string; date: string; time: string }) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onSchedule }) => {
    const [eventName, setEventName] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventTime, setEventTime] = useState("");
		const [error, setError] = useState("")

    // Get current date in YYYY-MM-DD format for min date
    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const handleSchedule = () => {
        if (!eventName.trim()) {
            setError("Please enter an event name");
            return;
        }
        if (!eventDate) {
            setError("Please select a date");
            return;
        }
        if (!eventTime) {
            setError("Please select a time");
            return;
        }

        // Check if the selected date/time is in the future
        const selectedDateTime = new Date(`${eventDate}T${eventTime}`);
        const now = new Date();
        
        if (selectedDateTime <= now) {
            setError("Please select a future date and time");
            return;
        }

        if (onSchedule) {
					onSchedule({
							name: eventName.trim(),
							date: eventDate,
							time: eventTime
					});
        }
    };

    return (
			<div className="fixed mb-15">
				<Card  className="!bg-pink-600 p-2 px-3">
					<div className="flex justify-between items-center text-center mb-4">
						<h1 className="font-medium text-pink-50 text-lg">Schedule Event</h1>
						{onClose && (
							<button 
								onClick={onClose}
								className="text-pink-50 hover:text-pink-200 text-xl font-bold"
							>
								×
							</button>
						)}
					</div>
					<div className="space-y-4">
						<div>
							<h3 className="font-medium text-pink-50 mb-2">Event Name</h3>
							<Input
								value={eventName}
								onChange={(e) => setEventName(e.target.value)}
								placeholder="Enter event name"
								className="w-full"
							/>
						</div>
						<div>
							<h3 className="font-medium text-pink-50 mb-2">Select Date</h3>
							<input
								type="date"
								value={eventDate}
								onChange={(e) => setEventDate(e.target.value)}
								min={getCurrentDate()}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
							/>
						</div>
						<div>
							<h3 className="font-medium text-pink-50 mb-2">Select Time</h3>
							<input
								type="time"
								value={eventTime}
								onChange={(e) => setEventTime(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
							/>
						</div>
					</div>
					<div className="flex gap-2 mt-6">
							{onClose && (
								<Button 
									variant="outline" 
									onClick={onClose}
									className="flex-1 !bg-transparent !border-pink-200 !text-pink-50 hover:!bg-pink-700"
								>
									Cancel
								</Button>
							)}
							<Button 
								onClick={handleSchedule}
								className="flex-1 !bg-pink-50 !text-pink-600 hover:!bg-pink-100"
							>
								Schedule Event
							</Button>
					</div>
				</Card>
			</div>
    );
};