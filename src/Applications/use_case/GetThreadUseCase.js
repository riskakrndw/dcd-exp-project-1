// const NotFoundError = require("../../Commons/exceptions/NotFoundError");
// const CommentedThread = require("../../Domains/threads/entities/CommentedThread");

// class GetThreadUseCase {
//   constructor({ threadRepository, commentRepository }) {
//     this._threadRepository = threadRepository;
//     this._commentRepository = commentRepository;
//   }

//   async execute(threadId) {
//     const getThread = await this._threadRepository.getThread(threadId);

//     if (getThread.length === 0) {
//       throw new NotFoundError("Thread tidak ditemukan");
//     }

//     const getComments = await this._commentRepository.getComments(threadId);

//     const commentLikes = async (commentId) => {
//       const count = await this._likeRepository.countLike(commentId);
//       return Number(count);
//     };

//     const comments = await Promise.all(
//       getComments.map(async (comment) => ({
//         id: comment.id,
//         username: comment.username,
//         date: comment.updated_at,
//         content: comment.is_delete
//           ? "**komentar telah dihapus**"
//           : comment.content,
//         replies: await getReplies(comment.id),
//         likeCount: await commentLikes(comment.id),
//       }))
//     );

//     return new CommentedThread({
//       id: getThread[0].id,
//       title: getThread[0].title,
//       body: getThread[0].body,
//       date: getThread[0].created_at,
//       username: getThread[0].username,
//       comments,
//     });
//   }
// }

// module.exports = GetThreadUseCase;
