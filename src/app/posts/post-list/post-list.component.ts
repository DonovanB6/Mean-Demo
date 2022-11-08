import { Component, OnDestroy, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";

import { Post } from '../post.model';
import { PostsService } from "../posts.service";

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['post-list.component.css']
})

export class PostListComponent implements OnInit, OnDestroy {
 /*  posts = [
    {title: 'First Post', content: 'This is the first post\'s content'},
    {title: 'Second Post', content: 'This is the Second post\'s content'},
    {title: 'Third Post', content: 'This is the Third post\'s content'}
  ]; option shift a for multi comment */
   posts: Post[] = [];
   isLoading = false;
   totalPosts=10;
   postsPerPage = 2;
   currentPage = 1;
   pageSizeOptions = [1,2,5,10];
   userIsAuthenticated = false;
   userId: string;
   private postsSub: Subscription;
   private authStatusSub: Subscription;

  constructor(public postsService: PostsService, private authService: AuthService ) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage,this.currentPage);
    this.userId = this.authService.getUserId();
    this.postsSub = this.postsService.getPostUpdateListener().subscribe((postData:{posts: Post[], postCount: number}) => {
      this.isLoading=false;
      this.totalPosts = postData.postCount;
      this.posts = postData.posts;
    });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    });
  }

  onChangedPage(pageData: PageEvent)
  {
    this.isLoading=true;
    this.currentPage= pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage,this.currentPage);
  }

  onDelete(postID: string) {
    this.isLoading;
    this.postsService.deletePost(postID).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage,this.currentPage);
    });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
