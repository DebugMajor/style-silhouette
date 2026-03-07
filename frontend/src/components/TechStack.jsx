import { FaReact, FaNodeJs } from "react-icons/fa"
import { SiMongodb, SiOpenai } from "react-icons/si"

function TechStack() {

    const tech = [
        { icon: <FaReact />, name: "React" },
        { icon: <FaNodeJs />, name: "Node" },
        { icon: <SiMongodb />, name: "MongoDB" },
        { icon: <SiOpenai />, name: "OpenAI" }
    ]

    return (

        <section className="section">

            <h2 className="title">Technology</h2>

            <div className="grid">

                {tech.map((t, i) => (

                    <div className="card" key={i}>

                        <div style={{ fontSize: "40px" }}>{t.icon}</div>

                        <h3>{t.name}</h3>

                    </div>

                ))}

            </div>

        </section>

    )

}

export default TechStack