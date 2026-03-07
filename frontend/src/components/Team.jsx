import { Github, Linkedin, Mail } from "lucide-react"

function Team() {

    const members = [

        {
            name: "Shashwat Dhondyal",
            role: "Frontend + AI Integration",
            github: "https://github.com/DebugMajor",
            linkedin: "https://www.linkedin.com/in/okshash/",
            email: "shashwatdhondyal812@gmail.com"
        },

        {
            name: "Tejaswini Rath",
            role: "Backend Developer",
            github: "https://github.com/TejaswiniRath",
            linkedin: "https://www.linkedin.com/in/tejaswini-rath-931018287/",
            email: "tejasmita108@gmail.com"
        },

        {
            name: "Sanjay Sutar",
            role: "Database & API",
            github: "https://github.com/SanjaySutar25",
            linkedin: "https://www.linkedin.com/in/sanjay-sutar-43a1b1226/",
            email: "#"
        },

        {
            name: "Narayan Hari Singh",
            role: "System Design",
            github: "#",
            linkedin: "#",
            email: "#"
        }

    ]

    return (

        <section id="team" className="section">

            <div className="container">

                <h2 className="section-title">
                    Development Team
                </h2>

                <p className="section-subtitle">
                    Meet the developers building Style-A-Silhouette
                </p>

                <div className="team-grid">

                    {members.map((member, index) => (

                        <div className="team-card" key={index}>

                            <div className="avatar"></div>

                            <h3 className="team-name">
                                {member.name}
                            </h3>

                            <p className="team-role">
                                {member.role}
                            </p>

                            <div className="team-icons">

                                <a href={member.github} target="_blank">
                                    <Github size={18} />
                                </a>

                                <a href={member.linkedin} target="_blank">
                                    <Linkedin size={18} />
                                </a>

                                <a href={`mailto:${member.email}`}>
                                    <Mail size={18} />
                                </a>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </section>

    )

}

export default Team