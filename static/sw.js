/* eslint-disable */
self.addEventListener("push", e => {
    const notification = e.data.json();
    self.registration.showNotification(
        notification.title,
        {
            body: notification.body,
            image: notification.image,
            icon: notification.image
        }
    );
});