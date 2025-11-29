// Service Worker for Push Notifications using VAPID
// Following Web Push Protocol specification

// Listen for push events
self.addEventListener('push', (event) => {
  console.log('========================================');
  console.log('[Service Worker] 🔔 PUSH EVENT RECEIVED');
  console.log('========================================');
  console.log('[Service Worker] Event object:', event);
  console.log('[Service Worker] Event has data:', !!event.data);
  console.log('[Service Worker] Event timestamp:', new Date().toISOString());

  let notificationData = {
    title: 'New Notification',
    body: 'You have a new notification',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'booking-notification',
    data: {
      bookingId: null,
      venueName: null,
      date: null,
      amount: null,
      type: null,
    },
  };

  // Parse the push data if available
  if (event.data) {
    try {
      console.log('[Service Worker] Attempting to parse push data as JSON...');
      const data = event.data.json();
      console.log('[Service Worker] ✅ Successfully parsed push data:', JSON.stringify(data, null, 2));
      
      // Backend sends: bookingId, venueName, date, amount, type, title, body
      notificationData = {
        title: data.title || 'New Booking Received',
        body: data.body || 'You have a new booking',
        icon: data.icon || '/favicon.svg',
        badge: data.badge || '/favicon.svg',
        tag: data.type === 'new_booking' ? 'booking-notification' : 'notification',
        data: {
          bookingId: data.bookingId || null,
          venueName: data.venueName || null,
          date: data.date || null,
          amount: data.amount || null,
          type: data.type || null,
          // Store all data for notification click handler
          url: data.type === 'new_booking' ? '/partner/bookings' : '/partner/dashboard',
        },
      };
      console.log('[Service Worker] Notification data prepared:', JSON.stringify(notificationData, null, 2));
    } catch (e) {
      console.error('[Service Worker] ❌ Error parsing push data as JSON:', e);
      // If not JSON, try text
      try {
        const text = event.data.text();
        console.log('[Service Worker] Parsed as text:', text);
        if (text) {
          notificationData.body = text;
        }
      } catch (textError) {
        console.error('[Service Worker] ❌ Error parsing push data as text:', textError);
      }
    }
  } else {
    console.warn('[Service Worker] ⚠️ Push event has no data');
  }

  // Show notification
  console.log('[Service Worker] Attempting to show notification...');
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: false,
      vibrate: [200, 100, 200],
      // Add actions for better UX (optional)
      actions: notificationData.data.type === 'new_booking' ? [
        {
          action: 'view',
          title: 'View Booking',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ] : [],
    }).then(() => {
      console.log('[Service Worker] ✅ Notification shown successfully');
      console.log('[Service Worker] Notification title:', notificationData.title);
      console.log('[Service Worker] Notification body:', notificationData.body);
      console.log('[Service Worker] Notification data:', notificationData.data);
      console.log('========================================');
    }).catch((error) => {
      console.error('[Service Worker] ❌ Error showing notification:', error);
      console.log('========================================');
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] 🔘 Notification click received');
  console.log('[Service Worker] Click event:', event);
  console.log('[Service Worker] Notification data:', event.notification.data);

  event.notification.close();

  // Handle action buttons
  const action = event.action;
  const data = event.notification.data || {};

  // Determine URL based on notification type and action
  let urlToOpen = '/partner/bookings';
  
  if (data.type === 'new_booking') {
    // For new booking notifications, go to bookings page
    // If bookingId is available, could navigate to specific booking
    urlToOpen = data.bookingId 
      ? `/partner/bookings?bookingId=${data.bookingId}` 
      : '/partner/bookings';
  } else {
    urlToOpen = data.url || '/partner/dashboard';
  }

  // Handle dismiss action
  if (action === 'dismiss') {
    return; // Just close the notification
  }

  // Handle view action or default click
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        // Focus any open window/tab of the app
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Post message to navigate (React app will handle navigation)
          client.postMessage({
            type: 'NAVIGATE',
            url: urlToOpen,
            data: data, // Include booking data
          });
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event);
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated');
  event.waitUntil(
    clients.claim().then(() => {
      console.log('[Service Worker] Claimed clients');
    })
  );
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installed');
  // Force activation of new service worker
  self.skipWaiting();
});

