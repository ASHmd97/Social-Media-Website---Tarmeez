let token = localStorage.getItem("token");
let myProfileId = localStorage.getItem("userId");
const userId = urlPrams.get("userId");

const userImageEl = document.getElementById("user-image");
const userNameEl = document.getElementById("user-name");
const userUsernameEl = document.getElementById("user-username");
const userEmailEl = document.getElementById("user-email");
const postsCountEl = document.getElementById("posts-count");
const commentsCountEl = document.getElementById("comments-count");

function getUserInfo(userId) {
  axios
    .get(`${baseUrl}/users/${userId}`)
    .then(function (response) {
      // handle success

      let info = response.data.data;
      let userPic;
      let name = info.name;
      let userName = info.username;
      let email = info.email;

      let postsCount = info.posts_count;
      let commentsCount = info.comments_count;

      if (typeof info.profile_image === "string") {
        userPic = info.profile_image;
      } else {
        userPic = `./images/user-img/user-img-${randomInteger(1, 7)}.jpg`;
      }

      userImageEl.src = userPic;
      userNameEl.innerHTML = name;
      userUsernameEl.innerHTML = userName;
      userEmailEl.innerHTML = email;
      postsCountEl.innerHTML = postsCount;
      commentsCountEl.innerHTML = commentsCount;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
}

function getUserPosts(clear = false, userid) {
  axios
    .get(`${baseUrl}/users/${userid}/posts`)
    .then(function (response) {
      // handle success
      let posts = response.data.data;
      let userPic;
      let postImg;

      if (clear) {
        userPostsDiv.innerHTML = "";
      }

      for (let post of posts) {
        let userName = post.author.username;
        let postUserId = post.author.id;
        let postId = post.id;
        let postTitle = post.title ?? "";
        let postBody = post.body;
        let postTime = post.created_at;
        let commentsCount = post.comments_count;
        // let postTags = post.tags ?? [];

        if (typeof post.author.profile_image === "string") {
          userPic = post.author.profile_image;
        } else {
          userPic = `./images/user-img/user-img-${randomInteger(1, 7)}.jpg`;
        }
        if (typeof post.image === "string") {
          postImg = post.image;
        } else {
          postImg = "";
        }

        let content = `
          <!-- post -->
          <div class="post card shadow-lg my-3">
            <div class="card-header">
              <div>
                <img class="profile_image border border-2" src=${userPic} alt="profile-image">
                <b>${userName}</b>
              </div>
              <div style="margin-left: auto;">
                ${
                  postUserId == myProfileId
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
    
            <div class="card-body" onclick="postClicked(${postId})" style="cursor: pointer;">
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
              
              <p class="card-text">${postBody}</p>
    
              <h6 class="gray mt-1">${postTime}</h6>
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
            </div>
          </div>
          <!--\\ post //-->  
        `;
        userPostsDiv.insertAdjacentHTML("beforeend", content);
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
}

function check() {
  if (token) {
    if (userId) {
      getUserInfo(userId);
      getUserPosts(true, userId);
    } else {
      getUserInfo(myProfileId);
      getUserPosts(true, myProfileId);
    }
  }
}
check();
setupUI();
