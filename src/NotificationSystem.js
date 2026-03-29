export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
    return;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("StudyBrain AI", {
        body: "Notifications are now active! We'll remind you of deadlines.",
        icon: "/favicon.svg"
      });
    }
  }
};

export const sendTaskReminder = (taskName) => {
  if (Notification.permission === "granted") {
    new Notification("Upcoming Deadline!", {
      body: `Don't forget: ${taskName} is due soon!`,
      icon: "/favicon.svg"
    });
  }
};