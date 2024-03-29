id = urlPrams.get("postId");
const postDiv = document.querySelector(".post");

function getPost(id) {
  postDiv.innerHTML = "";
  axios
    .get(`${baseUrl}/posts/${id}`)
    .then(function (response) {
      // handle success

      let userId = localStorage.getItem("userId");
      let post = response.data.data;
      let postUserId = post.author.id;
      let comments = post.comments;
      let userName = post.author.username;
      let postTitle = post.title ?? "";
      let postBody = post.body;
      let postTime = post.created_at;
      let commentsCount = post.comments_count;
      let postTags = post.tags ?? [];
      let postId = post.id;

      let userPic;
      let postImg;
      if (post.author.profile_image.length > 0) {
        userPic = post.author.profile_image;
      } else {
        userPic = `./images/user-img/user-img-${randomInteger(1, 7)}.jpg`;
      }

      if (typeof post.image === "string") {
        postImg = post.image;
      } else {
        postImg = "";
      }

      document.getElementById("username-span").innerHTML = `${userName}'s`;

      let commentsContent = ``;

      for (let comment of comments) {
        let commentUserPic;

        if (typeof comment.author.profile_image === "string") {
          commentUserPic = comment.author.profile_image;
        } else {
          commentUserPic = `./images/user-img/user-img-${randomInteger(
            1,
            7
          )}.jpg`;
        }
        commentsContent += `
            <!-- comment -->
            <div class="comment p-2">
                <!-- user Data -->
                <div class="user_data" onclick="userClicked(${comment.author.id})" style="cursor: pointer;">
                    <img class="comment-profile_image border border-2"
                        src="${commentUserPic}" alt="profile-image">
                    <h6 class="username" style="display: inline-block;">
                        ${comment.author.username}
                    </h6>
                </div>
                <!-- the comment -->
                <p class="comment_text px-4 my-0">
                    ${comment.body}
                </p>
            </div>
            <hr>
            <!-- comment //-->
        `;
      }

      let content = `
          <!-- post -->
          <div class="post card shadow-lg my-3">
            <div class="card-header">
              <div onclick="userClicked(${postUserId})" style="cursor: pointer;">
                <img class="profile_image border border-2" src=${userPic} alt="profile-image">
                <b>${userName}</b>
              </div>
              <div style="margin-left: auto;">
                ${
                  postUserId == userId
                    ? `
                    <button type="button" class="btn btn-primary m-1" onclick="openEditPostModal('${encodeURIComponent(
                      JSON.stringify(post)
                    )}')"> 
                      <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button type="button" class="btn btn-danger m-1" onclick="openDeletePostModal('${encodeURIComponent(
                      JSON.stringify(post)
                    )}')"> 
                      <i class="fa-solid fa-trash"></i>
                    </button>
                      `
                    : ""
                }
              </div>
            </div>
    
            <div class="card-body">
                ${
                  postImg
                    ? `<img class="w-100 border border-2 rounded" src="${postImg}" alt="post-image">`
                    : ""
                }
                ${
                  postTitle
                    ? `<h5 class="card-title mt-2">${postTitle}</h5>`
                    : ""
                }
              
              <p class="card-text mt-2">${postBody}</p>
    
              <h6 class="gray">${postTime}</h6>
              <hr>
              <div class="footer">
                <div class="comments d-flex align-items-center">
                  <h6>
                    (<span class="comments_number">${commentsCount}</span>)Comments
                  </h6>
                </div>
                <div class="tags">
                </div>
              </div>
              <div class="comments rounded" style="background-color: #D8DDE6;">
                ${commentsContent}
              </div>
              <!-- add comment section -->
              </div>
              <div class="add_comment rounded d-flex">
                  <input type="text" class="w-100 border border-2 rounded-start" id="comment-input" placeholder="add your comment...">
                  <button type="button" class="rounded-0 rounded-end btn btn-primary" onclick="sendCommentFunction()">Send</button>
              </div>
          </div>
          <!--\\ post //-->
        `;
      postDiv.insertAdjacentHTML("beforeend", content);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
}

function sendCommentFunction() {
  const commentContent = document.getElementById("comment-input").value;
  const token = localStorage.getItem("token");
  let url = `${baseUrl}/posts/${id}/comments`;
  let params = {
    body: commentContent,
  };

  axios
    .post(url, params, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      getPost(id);
      showAlert("The comment has been created successfully");
    })
    .catch(function (error) {
      let errorMassage = error.response.data.message;
      showAlert(errorMassage, "danger");
    });
}

setupUI();
getPost(pagePostId);
