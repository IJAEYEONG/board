function generateLinks(results) {
  const links = results.map(
    (submission) => `
      <div class="post">
        <a href="/submission/${submission.id}" class="post-title">${submission.title}</a>
        <p class="post-date">${submission.date}</p>
        <div class="post-actions">
          <a href="/delete/${submission.id}" class="btn small">삭제</a>
          <a href="/edit/${submission.id}" class="btn small">수정</a>
        </div>
      </div>
    `
  ).join("");

  return links;
}

module.exports = {
  generateLinks
};