import "bootstrap/dist/css/bootstrap.min.css";
import { Card } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import ComputerIcon from "@mui/icons-material/Computer";
import "../Stylesheet.css";
import { TbPrompt } from "react-icons/tb";
import { MdAgriculture } from "react-icons/md";
import { IoLogoReact } from "react-icons/io5";

const Home = ({ isActive }) => {
  return (
    <article className={`about ${isActive ? 'active' : ''}`} data-page="about">
      {/* About Me */}
      <header>
        <h2 className="h2 article-title">Mohammed Ashfar M</h2>
      </header>

      <section className="about-text">
        <p>
          I am Mohammed Ashfar, a passionate Web Developer with expertise in
          building responsive, user-friendly websites and applications. Along
          with my technical skills in modern web technologies, I bring a strong
          background in Agriculture and diverse problem-solving abilities. This
          unique combination allows me to create innovative solutions that
          bridge technology and real-world applications. Known for adaptability,
          creativity, and continuous learning, I am driven to deliver impactful
          results in every project I take on.
        </p>
      </section>

      {/* What I'm Doing */}
      <section className="service">
        <h3 className="h3 service-title">What I'm Doing</h3>

        <Row xs={1} md={2} className="g-4">
          <Col>
            <Card className="service-item">
              <Card.Body className="service-content-box">
                <Row>
                  <Col md={3} className="service-icon-box d-flex align-items-center">
                    <ComputerIcon style={{ fontSize: 40, color:" hsl(45, 54%, 58%)" }}  />
                    
                  </Col>
                  <Col md={9}>
                    <Card.Title className="h4 service-item-title">
                     Web Developer
                    </Card.Title>
                    <Card.Text className="service-item-text">
                      Developed and deployed a real-time data visualization dashboard with React to extract
                      valuable insights.
                    </Card.Text>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card className="service-item">
              <Card.Body className="service-content-box">
                <Row>
                  <Col md={3} className="service-icon-box d-flex align-items-center">
                   <TbPrompt style={{ fontSize: 40, color:" hsl(45, 54%, 58%)" }}/>
                  </Col>
                  <Col md={9}>
                    <Card.Title className="h4 service-item-title">
                      Prompt Engineering
                    </Card.Title>
                    <Card.Text className="service-item-text">
                   prompt optimization in designing and developing prompts to solve real-world problems and enhance AI performance.
                    </Card.Text>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row xs={1} md={2} className="g-4 mt-3">
          <Col>
            <Card className="service-item">
              <Card.Body className="service-content-box">
                <Row>
                  <Col md={3} className="service-icon-box d-flex align-items-center">
                   <IoLogoReact style={{ fontSize: 40, color:" hsl(45, 54%, 58%)" }}/>
                  </Col>
                  <Col md={9} >
                    <Card.Title className="h4 service-item-title">
                      MERN
                    </Card.Title>
                    <Card.Text className="service-item-text">
                     Building a real-time React dashboard to  utilizing reusable components, React Query for  40% faster UI performance.
                    </Card.Text>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card className="service-item">
              <Card.Body className="service-content-box">
                <Row>
                  <Col md={3} className="service-icon-box d-flex align-items-center">
                    <MdAgriculture style={{ fontSize: 40, color:" hsl(45, 54%, 58%)" }}/>
                  </Col>
                  <Col md={9}>
                    <Card.Title className="h4 service-item-title">
                      Smart Agriculture
                    </Card.Title>
                    <Card.Text className="service-item-text">
                     Expertise directly with the port’s transformative role in
                      shaping future opportunities.
                    </Card.Text>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
    </article>
  );
};

export default Home;
