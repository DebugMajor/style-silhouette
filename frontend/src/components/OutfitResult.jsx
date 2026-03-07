function OutfitResult({ result, image }) {

    return (

        <div className="result-panel">

            <h2>Styling Result</h2>

            <img src={image} className="result-image" />

            <div className="result-grid">

                <div className="result-card">
                    <h3>Top</h3>
                    <p>{result.top}</p>
                </div>

                <div className="result-card">
                    <h3>Bottom</h3>
                    <p>{result.bottom}</p>
                </div>

                <div className="result-card">
                    <h3>Shoes</h3>
                    <p>{result.shoes}</p>
                </div>

            </div>

            <div className="suggestions">

                <h3>Suggestions</h3>

                <ul>

                    {result.styleSuggestions?.map((s, i) => (
                        <li key={i}>{s}</li>
                    ))}

                </ul>

            </div>

            <div className="score">

                <h3>Style Score</h3>

                <div className="score-bar">

                    <div
                        className="score-fill"
                        style={{ width: `${result.styleScore * 10}%` }}
                    ></div>

                </div>

                <p>{result.styleScore} / 10</p>

            </div>

        </div>

    );

}

export default OutfitResult;