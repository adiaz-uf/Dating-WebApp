import React, { useState } from "react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { MessageBox } from "../../components/MessageBox";

interface CreateEventModalProps {
  onClose?: () => void;
  onSchedule?: (eventData: { name: string; date: string; time: string }) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onSchedule }) => {
    const [eventName, setEventName] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventTime, setEventTime] = useState("");
    const [error, setError] = useState("");

    // Get current date in YYYY-MM-DD format for min date
    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const handleSchedule = () => {
        setError(""); // Clear previous errors

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
            // Clear form after successful schedule
            setEventName("");
            setEventDate("");
            setEventTime("");
        }
    };

    // Clear error after 5 seconds
    React.useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
			<>
				{/* Floating event modal positioned above the button */}
				<div className="absolute bottom-14 left-0 z-50 animate-in slide-in-from-bottom-2">
					<Card className="!bg-pink-600 p-4 w-70 shadow-lg border border-pink-300">
						<div className="flex justify-between items-center mb-3">
							<h1 className="font-medium text-pink-50 text-lg">Schedule Event</h1>
							{onClose && (
								<button 
									onClick={onClose}
									className="text-pink-50 hover:text-pink-200 text-xl font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-pink-700"
									title="Close"
								>
									×
								</button>
							)}
						</div>
						
						<div className="space-y-3">
							<div>
								<h3 className="font-medium text-pink-50 mb-1 text-sm">Event Name</h3>
								<Input
									value={eventName}
									onChange={(e) => setEventName(e.target.value)}
									placeholder="Enter event name"
									className="w-full text-sm"
								/>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<div>
								<h3 className="font-medium text-pink-50 mb-1 text-sm">Date</h3>
								<input
										type="date"
										value={eventDate}
										onChange={(e) => setEventDate(e.target.value)}
										min={getCurrentDate()}
										className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
								/>
							</div>
							<div>
								<h3 className="font-medium text-pink-50 mb-1 text-sm">Time</h3>
								<input
									type="time"
									value={eventTime}
									onChange={(e) => setEventTime(e.target.value)}
									className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
								/>
								</div>
							</div>
						</div>
						<div className="flex gap-2 mt-4">
								{onClose && (
									<Button 
											variant="outline" 
											onClick={onClose}
											className="flex-1 !bg-transparent !border-pink-200 !text-pink-50 hover:!bg-pink-700 text-sm py-1"
									>
											Cancel
									</Button>
								)}
								<Button 
									onClick={handleSchedule}
									className="flex-1 !bg-pink-50 !text-pink-600 hover:!bg-pink-100 text-sm py-1"
								>
									Schedule
								</Button>
						</div>
						
					{/* Small arrow pointing down to the button */}
					<div className="absolute -bottom-2 left-6 w-4 h-4 bg-pink-600 border-b border-r border-pink-300 transform rotate-45"></div>
				</Card>
			</div>

			{/* Error MessageBox positioned at bottom right */}
			{error && (
				<div className="fixed bottom-4 right-4 z-[60]">
					<MessageBox type="error" message={error} show={!!error} />
				</div>
			)}
		</>
	);
};