export const mockChats = [
    {
        id: 1,
        user: {
            name: 'Marko Petrović',
            info: 'marko.p@example.com',
        },
        lastMessage: 'Imam pitanje u vezi rezervacije.',
        unreadCount: 2,
        timestamp: '10:32',
        messages: [
            {
                sender: 'customer',
                text: 'Zdravo, imam pitanje u vezi rezervacije.',
                timestamp: '10:30',
            },
            {
                sender: 'customer',
                text: 'Da li mogu promeniti datum putovanja?',
                timestamp: '10:32',
            },
        ],
    },
    {
        id: 2,
        user: {
            name: 'Ivana Jovanović',
            info: 'ivana.j@example.com',
        },
        lastMessage: 'Molim vas za pomoć oko prijave.',
        unreadCount: 1,
        timestamp: '09:15',
        messages: [
            {
                sender: 'customer',
                text: 'Molim vas za pomoć oko prijave na sistem.',
                timestamp: '09:15',
            },
        ],
    },
    {
        id: 3,
        user: {
            name: 'Nikola Nikolić',
            info: 'nikola.n@example.com',
        },
        lastMessage: 'Hvala na pomoći!',
        unreadCount: 0,
        timestamp: '08:50',
        messages: [
            {
                sender: 'customer',
                text: 'Pozdrav, kako mogu promeniti lozinku?',
                timestamp: '08:40',
            },
            {
                sender: 'admin',
                text: 'Hvala na pitanju, možete to uraditi u podešavanjima.',
                timestamp: '08:45',
            },
            {
                sender: 'customer',
                text: 'Hvala na pomoći!',
                timestamp: '08:50',
            },
        ],
    },
];
