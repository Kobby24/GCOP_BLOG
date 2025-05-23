import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  IconButton,
  Modal,
  Button,
  TextField,
  Snackbar
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import Comment from "./Comment";
import Slider from "react-slick";

const Slide = () => {
  const fallbackImages = [
    { title: "Welcome to Church", url: "/images/church1.jpg" },
    { title: "Join Our Services", url: "/images/church2.jpg" },
    { title: "Be Part of Our Community", url: "/images/church3.jpg" }
  ];
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get("https://print-gurus-jmfg.onrender.com/events/")
      .then((response) => {
        const fetchedItems = response.data.data;
        if (fetchedItems.length === 0) {
          setItems(fallbackImages);
        } else {
          setItems(fetchedItems);
        }
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setItems(fallbackImages);
      });
  }, []);

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToScroll: 1,
    arrows: true
  };

  return (
    <Box sx={{ position: "relative", overflow: "hidden" }}>
      <Slider {...carouselSettings}>
        {items.map((item, index) => (
          <Box
            key={index}
            sx={{
              height: { xs: "40vh", sm: "50vh", md: "70vh" },  // 🎯 Responsive height
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: item.url.endsWith(".mp4")
                ? "black"
                : `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${item.url}) center/contain no-repeat`
            }}
          >
            {item.url.endsWith(".mp4") && (
              <video
                src={item.url}
                autoPlay
                loop
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain" // 🎯 Keeps video fully fitting
                }}
              />
            )}
            <Typography
              variant="h3"
              sx={{
                position: "absolute",
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
                px: 2,
                fontSize: { xs: "1.5rem", sm: "2rem", md: "3rem" } // 🎯 Responsive font size
              }}
            >
              {item.title}
            </Typography>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};


const BlogGrid = () => {
  const [posts, setPosts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [snack, setSnack] = useState({ open: false, message: '' });

  useEffect(() => {
    axios.get(' https://print-gurus-jmfg.onrender.com/all-posts/')
      .then(response => {
        setPosts(response.data);
      })
      .catch(error => {
        console.error("Error fetching posts:", error);
      });
  }, []);

  useEffect(() => {
    axios.get('https://print-gurus-jmfg.onrender.com/csrf/')
      .then(res => {
        axios.defaults.headers.post['X-CSRFToken'] = res.data.csrfToken;
      });
  }, []);

  const handleLike = (id) => {
    axios.post(`https://print-gurus-jmfg.onrender.com/like-post/${id}/`)
      .then(res => {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === id ? { ...post, like_count: res.data.likes } : post
          )
        );
      })
      .catch(err => {
        console.error("Failed to like:", err);
      });
  };

  const handleShare = async (url) => {
    const fullUrl = window.location.origin + url;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Check out this blog post", url: fullUrl });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      setShareUrl(fullUrl);
      setOpenModal(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setSnack({ open: true, message: 'Link copied to clipboard!' });
      setOpenModal(false);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: 'Failed to copy link' });
    }
  };

  return (
    <>
      <Box
  sx={{
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "1fr 1fr",
      md: "1fr 1fr 1fr"
    },
    gap: 3,
    p: { xs: 1, sm: 2, md: 4 }, // <-- responsive padding
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "stretch"
  }}
>

        {posts.map((card, idx) => (
          <Card
            key={idx}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              height: 340,
              position: "relative",
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.03)"
              }
            }}
          >
            <CardActionArea href={card.url} sx={{ height: "100%" }}>
              {card.video_url ? (
                <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${card.video_url}?autoplay=0&mute=1&controls=0&loop=1&playlist=${card.video_url}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      objectFit: "cover"
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      width: "100%",
                      backgroundColor: "rgba(0,0,0,0.5)",
                      p: 2
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: "white", fontWeight: "bold" }}
                    >
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    width: "100%",
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${card.media})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    p: 2
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h5"
                      sx={{ color: "white", fontWeight: "bold" }}
                    >
                      {card.title}
                    </Typography>
                    <Typography sx={{ color: "white" }}>
                      {card.subtitle}
                    </Typography>
                  </CardContent>
                </Box>
              )}
            </CardActionArea>

            {/* Like & Share */}
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                display: "flex",
                gap: 1,
                zIndex: 2
              }}
            >
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleLike(card.id);
                }}
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.2)"
                }}
              >
                <FavoriteBorderIcon />
              </IconButton>
              <Typography sx={{ color: "white", fontWeight: "bold" }}>
                {card.like_count}
              </Typography>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleShare(card.url);
                }}
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.2)"
                }}
              >
                <ShareIcon />
              </IconButton>
              
            </Box>
          </Card>
        ))}
      </Box>

      {/* Share Modal */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="share-modal-title"
      >
        <Box
          sx={{
            backgroundColor: "white",
            padding: 4,
            borderRadius: 2,
            boxShadow: 24,
            width: 300,
            mx: "auto",
            mt: "20vh",
            display: "flex",
            flexDirection: "column",
            gap: 2
          }}
        >
          <Typography id="share-modal-title" variant="h6">
            Share This Blog
          </Typography>
          <TextField
            value={shareUrl}
            fullWidth
            variant="outlined"
            disabled
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCopyLink}
          >
            Copy Link
          </Button>
        </Box>
      </Modal>

      {/* Snackbar for Share */}
      <Snackbar
        open={snack.open}
        onClose={() => setSnack({ open: false, message: '' })}
        message={snack.message}
        autoHideDuration={3000}
      />
    </>
  );
};

export default BlogGrid;
export { Slide };