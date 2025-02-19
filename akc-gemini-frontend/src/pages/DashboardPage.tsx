// index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GAS React App</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/17.0.2/umd/react.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/17.0.2/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-gray-100">
    <div id="root"></div>
    <script type="text/babel">
        const App = () => {
            return (
                <div className="min-h-screen flex flex-col">
                    <header className="bg-blue-600 text-white p-4">
                        <h1 className="text-2xl">My GAS Dashboard</h1>
                    </header>
                    <main className="flex-grow p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Card title="Card 1" content="This is the content for card 1." />
                            <Card title="Card 2" content="This is the content for card 2." />
                            <Card title="Card 3" content="This is the content for card 3." />
                        </div>
                    </main>
                    <footer className="bg-gray-800 text-white p-4 text-center">
                        <p>&copy; 2023 My GAS Application</p>
                    </footer>
                </div>
            );
        };

        const Card = ({ title, content }) => {
            return (
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="font-bold text-xl mb-2">{title}</h2>
                    <p>{content}</p>
                </div>
            );
        };

        const DashboardPage = () => {
            return (
                <div>
                    <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
                    <p>Welcome to the AKC Gemini Dashboard!</p>
                </div>
            );
        };

        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>