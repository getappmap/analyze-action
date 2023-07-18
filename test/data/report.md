# AppMap






| Summary | Status |
| --- | --- |
| [Test failures](#test-failures) | :warning: 11 failed |
| [API changes](#api-changes) |🚧 6 breaking,&nbsp;:wrench: 1 non-breaking  |
| [Findings](#findings) |  :beetle: 1 new  :tada: 1 resolved  |
| [New AppMaps](#new-appmaps) |  :white_check_mark: None  |
| [Changed code behavior](#changed-code-behavior) |  :white_check_mark: No changes  |

## :warning: Test failures


<details>
<summary>
test/integration/following_test.rb:37
</summary>

<p/>

[test/integration/following_test.rb:37](https://github.com/land-of-apps/rails_tutorial_sample_app_7th_ed/blob/01089248c78834998594096c0ab3f9ccf023994f/test/integration/following_test.rb#L37) failed with error:

```
NameError: undefined local variable or method `relationships_path' for #<FollowTest:0x00007f2967ce5058>
Did you mean?  relationships
    test/integration/following_test.rb:39:in `block (2 levels) in <class:FollowTest>'
    test/integration/following_test.rb:38:in `block in <class:FollowTest>'
```




No relevant code changes found.

| Diagram | Link |
| --- | --- |
| Sequence diagram diff | No structural changes detected |
| AppMap | [minitest/Follow_should_follow_a_user_the_standard_way](https://app.land/github_artifact?owner=land-of-apps&repo=rails_tutorial_sample_app_7th_ed&run_id=5588315922&base_revision=b4fa12e60d51b20145d7111aea7f77d56278e8e3&head_revision=01089248c78834998594096c0ab3f9ccf023994f&path=head%2Fminitest%2FFollow_should_follow_a_user_the_standard_way.appmap.json) |

</details>


<details>
<summary>
test/integration/following_test.rb:44
</summary>

<p/>

[test/integration/following_test.rb:44](https://github.com/land-of-apps/rails_tutorial_sample_app_7th_ed/blob/01089248c78834998594096c0ab3f9ccf023994f/test/integration/following_test.rb#L44) failed with error:

```
NoMethodError: undefined method `relationships_path' for #<FollowTest:0x00007f2968bc7738>
Did you mean?  relationships
    test/integration/following_test.rb:46:in `block (2 levels) in <class:FollowTest>'
    test/integration/following_test.rb:45:in `block in <class:FollowTest>'
```




No relevant code changes found.

| Diagram | Link |
| --- | --- |
| Sequence diagram diff | No structural changes detected |
| AppMap | [minitest/Follow_should_follow_a_user_with_Hotwire](https://app.land/github_artifact?owner=land-of-apps&repo=rails_tutorial_sample_app_7th_ed&run_id=5588315922&base_revision=b4fa12e60d51b20145d7111aea7f77d56278e8e3&head_revision=01089248c78834998594096c0ab3f9ccf023994f&path=head%2Fminitest%2FFollow_should_follow_a_user_with_Hotwire.appmap.json) |

</details>


<details>
<summary>
test/controllers/microposts_controller_test.rb:9
</summary>

<p/>

[test/controllers/microposts_controller_test.rb:9](https://github.com/land-of-apps/rails_tutorial_sample_app_7th_ed/blob/01089248c78834998594096c0ab3f9ccf023994f/test/controllers/microposts_controller_test.rb#L9) failed with error:

```
ActionController::RoutingError: No route matches [POST] "/microposts"
    test/controllers/microposts_controller_test.rb:11:in `block (2 levels) in <class:MicropostsControllerTest>'
    test/controllers/microposts_controller_test.rb:10:in `block in <class:MicropostsControllerTest>'
```




No relevant code changes found.

| Diagram | Link |
| --- | --- |
| Sequence diagram diff | No structural changes detected |
| AppMap | [minitest/Microposts_controller_should_redirect_create_when_not_logged_in](https://app.land/github_artifact?owner=land-of-apps&repo=rails_tutorial_sample_app_7th_ed&run_id=5588315922&base_revision=b4fa12e60d51b20145d7111aea7f77d56278e8e3&head_revision=01089248c78834998594096c0ab3f9ccf023994f&path=head%2Fminitest%2FMicroposts_controller_should_redirect_create_when_not_logged_in.appmap.json) |

</details>


<details>
<summary>
test/controllers/microposts_controller_test.rb:24
</summary>

<p/>

[test/controllers/microposts_controller_test.rb:24](https://github.com/land-of-apps/rails_tutorial_sample_app_7th_ed/blob/01089248c78834998594096c0ab3f9ccf023994f/test/controllers/microposts_controller_test.rb#L24) failed with error:

```
NoMethodError: undefined method `micropost_path' for #<MicropostsControllerTest:0x00007f296739b268>
Did you mean?  microposts
    test/controllers/microposts_controller_test.rb:28:in `block (2 levels) in <class:MicropostsControllerTest>'
    test/controllers/microposts_controller_test.rb:27:in `block in <class:MicropostsControllerTest>'
```




No relevant code changes found.

| Diagram | Link |
| --- | --- |
| Sequence diagram diff | No structural changes detected |
| AppMap | [minitest/Microposts_controller_should_redirect_destroy_for_wrong_micropost](https://app.land/github_artifact?owner=land-of-apps&repo=rails_tutorial_sample_app_7th_ed&run_id=5588315922&base_revision=b4fa12e60d51b20145d7111aea7f77d56278e8e3&head_revision=01089248c78834998594096c0ab3f9ccf023994f&path=head%2Fminitest%2FMicroposts_controller_should_redirect_destroy_for_wrong_micropost.appmap.json) |

</details>


<details>
<summary>
test/controllers/microposts_controller_test.rb:16
</summary>

<p/>

[test/controllers/microposts_controller_test.rb:16](https://github.com/land-of-apps/rails_tutorial_sample_app_7th_ed/blob/01089248c78834998594096c0ab3f9ccf023994f/test/controllers/microposts_controller_test.rb#L16) failed with error:

```
NoMethodError: undefined method `micropost_path' for #<MicropostsControllerTest:0x00007f2967c4e220>
Did you mean?  microposts
    test/controllers/microposts_controller_test.rb:18:in `block (2 levels) in <class:MicropostsControllerTest>'
    test/controllers/microposts_controller_test.rb:17:in `block in <class:MicropostsControllerTest>'
```




No relevant code changes found.

| Diagram | Link |
| --- | --- |
| Sequence diagram diff | No structural changes detected |
| AppMap | [minitest/Microposts_controller_should_redirect_destroy_when_not_logged_in](https://app.land/github_artifact?owner=land-of-apps&repo=rails_tutorial_sample_app_7th_ed&run_id=5588315922&base_revision=b4fa12e60d51b20145d7111aea7f77d56278e8e3&head_revision=01089248c78834998594096c0ab3f9ccf023994f&path=head%2Fminitest%2FMicroposts_controller_should_redirect_destroy_when_not_logged_in.appmap.json) |

</details>


<details>
<summary>
test/integration/microposts_interface_test.rb:9
</summary>

<p/>

[test/integration/microposts_interface_test.rb:9](https://github.com/land-of-apps/rails_tutorial_sample_app_7th_ed/blob/01089248c78834998594096c0ab3f9ccf023994f/test/integration/microposts_interface_test.rb#L9) failed with error:

```
ActionView::Template::Error: undefined method `micropost_path' for #<ActionView::Base:0x00000000035048>

              target.public_send(method, *args)
                    ^^^^^^^^^^^^
Did you mean?  microposts_path
    app/views/microposts/_micropost.html.erb:13
    app/views/shared/_feed.html.erb:3
    app/views/static_pages/home.html.erb:16
    test/integration/microposts_interface_test.rb:11:in `block in <class:MicropostsInterfaceTest>'
```




No relevant code changes found.

| Diagram | Link |
| --- | --- |
| Sequence diagram diff | No structural changes detected |
| AppMap | [minitest/Microposts_interface_micropost_interface](https://app.land/github_artifact?owner=land-of-apps&repo=rails_tutorial_sample_app_7th_ed&run_id=5588315922&base_revision=b4fa12e60d51b20145d7111aea7f77d56278e8e3&head_revision=01089248c78834998594096c0ab3f9ccf023994f&path=head%2Fminitest%2FMicroposts_interface_micropost_interface.appmap.json) |

</details>


<details>
<summary>
test/controllers/relationships_controller_test.rb:5
</summary>

<p/>

[test/controllers/relationships_controller_test.rb:5](https://github.com/land-of-apps/rails_tutorial_sample_app_7th_ed/blob/01089248c78834998594096c0ab3f9ccf023994f/test/controllers/relationships_controller_test.rb#L5) failed with error:

```
NameError: undefined local variable or method `relationships_path' for #<RelationshipsControllerTest:0x00007f29644ffcd8>
Did you mean?  relationships
    test/controllers/relationships_controller_test.rb:7:in `block (2 levels) in <class:RelationshipsControllerTest>'
    test/controllers/relationships_controller_test.rb:6:in `block in <class:RelationshipsControllerTest>'
```




No relevant code changes found.

| Diagram | Link |
| --- | --- |
| Sequence diagram diff | No structural changes detected |
| AppMap | [minitest/Relationships_controller_create_should_require_logged-in_user](https://app.land/github_artifact?owner=land-of-apps&repo=rails_tutorial_sample_app_7th_ed&run_id=5588315922&base_revision=b4fa12e60d51b20145d7111aea7f77d56278e8e3&head_revision=01089248c78834998594096c0ab3f9ccf023994f&path=head%2Fminitest%2FRelationships_controller_create_should_require_logged-in_user.appmap.json) |

</details>


<details>
<summary>
test/controllers/relationships_controller_test.rb:12
</summary>

<p/>

[test/controllers/relationships_controller_test.rb:12](https://github.com/land-of-apps/rails_tutorial_sample_app_7th_ed/blob/01089248c78834998594096c0ab3f9ccf023994f/test/controllers/relationships_controller_test.rb#L12) failed with error:

```
NoMethodError: undefined method `relationship_path' for #<RelationshipsControllerTest:0x00007f2966294780>
Did you mean?  relationships
    test/controllers/relationships_controller_test.rb:14:in `block (2 levels) in <class:RelationshipsControllerTest>'
    test/controllers/relationships_controller_test.rb:13:in `block in <class:RelationshipsControllerTest>'
```




No relevant code changes found.

| Diagram | Link |
| --- | --- |
| Sequence diagram diff | No structural changes detected |
| AppMap | [minitest/Relationships_controller_destroy_should_require_logged-in_user](https://app.land/github_artifact?owner=land-of-apps&repo=rails_tutorial_sample_app_7th_ed&run_id=5588315922&base_revision=b4fa12e60d51b20145d7111aea7f77d56278e8e3&head_revision=01089248c78834998594096c0ab3f9ccf023994f&path=head%2Fminitest%2FRelationships_controller_destroy_should_require_logged-in_user.appmap.json) |

</details>


<details>
<summary>
test/integration/following_test.rb:63
</summary>

<p/>

[test/integration/following_test.rb:63](https://github.com/land-of-apps/rails_tutorial_sample_app_7th_ed/blob/01089248c78834998594096c0ab3f9ccf023994f/test/integration/following_test.rb#L63) failed with error:

```
NoMethodError: undefined method `relationship_path' for #<UnfollowTest:0x00007f2967ab49a0>
Did you mean?  relationships
    test/integration/following_test.rb:65:in `block (2 levels) in <class:UnfollowTest>'
    test/integration/following_test.rb:64:in `block in <class:UnfollowTest>'
```




No relevant code changes found.

| Diagram | Link |
| --- | --- |
| Sequence diagram diff | No structural changes detected |
| AppMap | [minitest/Unfollow_should_unfollow_a_user_the_standard_way](https://app.land/github_artifact?owner=land-of-apps&repo=rails_tutorial_sample_app_7th_ed&run_id=5588315922&base_revision=b4fa12e60d51b20145d7111aea7f77d56278e8e3&head_revision=01089248c78834998594096c0ab3f9ccf023994f&path=head%2Fminitest%2FUnfollow_should_unfollow_a_user_the_standard_way.appmap.json) |

</details>


<details>
<summary>
test/integration/following_test.rb:71
</summary>

<p/>

[test/integration/following_test.rb:71](https://github.com/land-of-apps/rails_tutorial_sample_app_7th_ed/blob/01089248c78834998594096c0ab3f9ccf023994f/test/integration/following_test.rb#L71) failed with error:

```
NoMethodError: undefined method `relationship_path' for #<UnfollowTest:0x00007f29647ce888>
Did you mean?  relationships
    test/integration/following_test.rb:73:in `block (2 levels) in <class:UnfollowTest>'
    test/integration/following_test.rb:72:in `block in <class:UnfollowTest>'
```




No relevant code changes found.

| Diagram | Link |
| --- | --- |
| Sequence diagram diff | No structural changes detected |
| AppMap | [minitest/Unfollow_should_unfollow_a_user_with_Hotwire](https://app.land/github_artifact?owner=land-of-apps&repo=rails_tutorial_sample_app_7th_ed&run_id=5588315922&base_revision=b4fa12e60d51b20145d7111aea7f77d56278e8e3&head_revision=01089248c78834998594096c0ab3f9ccf023994f&path=head%2Fminitest%2FUnfollow_should_unfollow_a_user_with_Hotwire.appmap.json) |

</details>


<details>
<summary>
test/integration/users_login_test.rb:45
</summary>

<p/>

[test/integration/users_login_test.rb:45](https://github.com/land-of-apps/rails_tutorial_sample_app_7th_ed/blob/01089248c78834998594096c0ab3f9ccf023994f/test/integration/users_login_test.rb#L45) failed with error:

```
ActionView::Template::Error: undefined method `micropost_path' for #<ActionView::Base:0x00000000045a88>

              target.public_send(method, *args)
                    ^^^^^^^^^^^^
Did you mean?  microposts_path
    app/views/microposts/_micropost.html.erb:13
    app/views/users/show.html.erb:19
    test/integration/users_login_test.rb:46:in `block in <class:ValidLoginTest>'
```




No relevant code changes found.

| Diagram | Link |
| --- | --- |
| Sequence diagram diff | No structural changes detected |
| AppMap | [minitest/Valid_login_redirect_after_login](https://app.land/github_artifact?owner=land-of-apps&repo=rails_tutorial_sample_app_7th_ed&run_id=5588315922&base_revision=b4fa12e60d51b20145d7111aea7f77d56278e8e3&head_revision=01089248c78834998594096c0ab3f9ccf023994f&path=head%2Fminitest%2FValid_login_redirect_after_login.appmap.json) |

</details>



## 🔄 API changes

### 🚧 Breaking changes

  - Remove path `paths./microposts/{id}` 
  - Remove path `paths./relationships` 
  - Remove path `paths./relationships/{id}` 
  - Remove response status code `paths./microposts.post.responses.302` 
  - Remove response status code `paths./microposts.post.responses.303` 
  - Remove response status code `paths./microposts.post.responses.422` 

### :wrench: Non-breaking changes

  - Add response status code  `paths./microposts.post.responses.200`


<details>
<summary>
  Detailed OpenAPI diff
</summary>

```diff
--- base/openapi.yml	2023-07-14 20:06:42.000000000 +0000
+++ head/openapi.yml	2023-07-18 13:52:39.000000000 +0000
@@ -100,18 +100,9 @@
   /microposts:
     post:
       responses:
-        '302':
-          content:
-            text/html: {}
-          description: Found
-        '303':
-          content:
-            text/html: {}
-          description: See Other
-        '422':
-          content:
-            text/html: {}
-          description: Unprocessable Entity
+        '200':
+          content: {}
+          description: OK
       requestBody:
         content:
           application/x-www-form-urlencoded:
@@ -123,13 +114,6 @@
                   properties:
                     content:
                       type: string
-  /microposts/{id}:
-    delete:
-      responses:
-        '303':
-          content:
-            text/html: {}
-          description: See Other
   /password_resets:
     post:
       responses:
@@ -198,40 +182,6 @@
           in: query
           schema:
             type: string
-  /relationships:
-    post:
-      responses:
-        '200':
-          content:
-            text/vnd.turbo-stream.html: {}
-          description: OK
-        '302':
-          content:
-            text/html: {}
-          description: Found
-        '303':
-          content:
-            text/html: {}
-          description: See Other
-      requestBody:
-        content:
-          application/x-www-form-urlencoded:
-            schema:
-              type: object
-              properties:
-                followed_id:
-                  type: string
-  /relationships/{id}:
-    delete:
-      responses:
-        '200':
-          content:
-            text/vnd.turbo-stream.html: {}
-          description: OK
-        '303':
-          content:
-            text/html: {}
-          description: See Other
   /signup:
     get:
       responses:
```
</details>



<h2 id="findings">Findings</h2>

### :beetle: New findings (1)


### N plus 1 SQL query

<details>
<summary>
  Finding details
</summary>

| Field | Value |
| --- | --- |
| Message | app_views_users_index_html_erb.render[257] contains 30 occurrences of SQL: SELECT &quot;users&quot;.* FROM &quot;users&quot; WHERE &quot;users&quot;.&quot;id&quot; &#x3D; ? LIMIT ? |
| AppMap | [minitest/Users_index_index_as_admin_including_pagination_and_delete_links.appmap.json](https://app.land/github_artifact?owner=land-of-apps&repo=rails_tutorial_sample_app_7th_ed&run_id=5588315922&base_revision=b4fa12e60d51b20145d7111aea7f77d56278e8e3&head_revision=01089248c78834998594096c0ab3f9ccf023994f&path=head%2Fminitest%2FUsers_index_index_as_admin_including_pagination_and_delete_links.appmap.json) |

##### Related code changes
No relevant code changes found.

##### Stack trace

* [app/helpers/sessions_helper.rb:19](https://github.com/land-of-apps/rails_tutorial_sample_app_7th_ed/blob/01089248c78834998594096c0ab3f9ccf023994f/app/helpers/sessions_helper.rb#L19)
* [app/views/users/index.html.erb](https://github.com/land-of-apps/rails_tutorial_sample_app_7th_ed/blob/01089248c78834998594096c0ab3f9ccf023994f/app/views/users/index.html.erb)
* vendor/bundle/ruby/3.1.0/gems/actionpack-7.0.4/lib/action_controller/metal/renderers.rb:140


</details>


### :tada: Resolved findings (1)


### N plus 1 SQL query

<details>
<summary>
  Finding details
</summary>

| Field | Value |
| --- | --- |
| Message | app_views_shared__feed_html_erb.render[658] contains 30 occurrences of SQL: SELECT &quot;users&quot;.* FROM &quot;users&quot; WHERE &quot;users&quot;.&quot;id&quot; &#x3D; ? LIMIT ? |
| AppMap | [minitest/Microposts_interface_micropost_interface.appmap.json](https://app.land/github_artifact?owner=land-of-apps&repo=rails_tutorial_sample_app_7th_ed&run_id=5588315922&base_revision=b4fa12e60d51b20145d7111aea7f77d56278e8e3&head_revision=01089248c78834998594096c0ab3f9ccf023994f&path=head%2Fminitest%2FMicroposts_interface_micropost_interface.appmap.json) |

##### Related code changes
No relevant code changes found.

##### Stack trace

* [app/helpers/sessions_helper.rb:19](https://github.com/land-of-apps/rails_tutorial_sample_app_7th_ed/blob/01089248c78834998594096c0ab3f9ccf023994f/app/helpers/sessions_helper.rb#L19)
* [app/helpers/sessions_helper.rb:35](https://github.com/land-of-apps/rails_tutorial_sample_app_7th_ed/blob/01089248c78834998594096c0ab3f9ccf023994f/app/helpers/sessions_helper.rb#L35)
* [app/views/shared/_feed.html.erb](https://github.com/land-of-apps/rails_tutorial_sample_app_7th_ed/blob/01089248c78834998594096c0ab3f9ccf023994f/app/views/shared/_feed.html.erb)
* [app/views/static_pages/home.html.erb](https://github.com/land-of-apps/rails_tutorial_sample_app_7th_ed/blob/01089248c78834998594096c0ab3f9ccf023994f/app/views/static_pages/home.html.erb)
* vendor/bundle/ruby/3.1.0/gems/actionpack-7.0.4/lib/action_controller/metal/renderers.rb:140


</details>
